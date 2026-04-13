from unittest.mock import patch

import pytest

from app.crud.project import create_project
from app.schemas.project import ProjectCreate
from app.services.ai_extract_service import extract_facts


@pytest.mark.asyncio
async def test_create_fragment(client):
    project_resp = await client.post("/projects", json={"name": "碎片测试", "goal": ""})
    project_id = project_resp.json()["data"]["id"]

    payload = {
        "project_id": project_id,
        "raw_content": "今天跑数据发现异常",
        "source_type": "text",
        "status": "active",
    }
    response = await client.post("/fragments", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 0
    assert data["data"]["raw_content"] == "今天跑数据发现异常"
    assert "id" in data["data"]


@pytest.mark.asyncio
async def test_create_fragment_with_facts(client):
    project_resp = await client.post("/projects", json={"name": "碎片带 facts 测试", "goal": ""})
    project_id = project_resp.json()["data"]["id"]

    payload = {
        "project_id": project_id,
        "raw_content": "今天发现异常",
        "source_type": "text",
        "status": "active",
        "facts": [
            {"category": "background", "fact": "发现异常"},
            {"category": "strategy", "fact": "准备优化"},
        ],
    }
    response = await client.post("/fragments", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 0
    assert len(data["data"]["facts"]) == 2


@pytest.mark.asyncio
async def test_list_fragments(client):
    project_resp = await client.post("/projects", json={"name": "碎片列表测试", "goal": ""})
    project_id = project_resp.json()["data"]["id"]

    await client.post(
        "/fragments",
        json={
            "project_id": project_id,
            "raw_content": "内容1",
            "source_type": "voice",
            "status": "active",
        },
    )

    response = await client.get("/fragments", params={"project_id": project_id})
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 0
    assert isinstance(data["data"], list)
    assert len(data["data"]) >= 1


@pytest.mark.asyncio
async def test_extract_facts_mock(client, db_session):
    # 直接通过 crud 创建项目，确保和 extract_facts 使用同一个 db_session
    project = await create_project(db_session, ProjectCreate(name="提取测试", goal="测试目标"))

    mock_json = '{"extracted_facts": [{"category": "background", "fact": "发现异常"}]}'
    with patch("app.services.ai_extract_service.chat_completion", return_value=mock_json):
        facts = await extract_facts("测试文本", project.id, db_session)

    assert len(facts) == 1
    assert facts[0].fact_text == "发现异常"
    assert facts[0].category == "background"


@pytest.mark.asyncio
async def test_extract_facts_endpoint_mock(client, db_session):
    project = await create_project(db_session, ProjectCreate(name="提取测试2", goal=""))

    mock_json = '{"extracted_facts": [{"category": "data", "fact": "DAU 提升 5%"}]}'
    with patch("app.services.ai_extract_service.chat_completion", return_value=mock_json):
        response = await client.post(
            "/fragments/extract",
            json={"raw_text": "测试文本", "project_id": project.id},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 0
    assert data["data"]["facts"][0]["fact_text"] == "DAU 提升 5%"
