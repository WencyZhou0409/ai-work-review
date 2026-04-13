from unittest.mock import patch

import pytest


@pytest.mark.asyncio
async def test_create_project(client):
    payload = {"name": "首页改版", "goal": "提升首页点击率"}
    response = await client.post("/projects", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 0
    assert data["data"]["name"] == "首页改版"
    assert data["data"]["goal"] == "提升首页点击率"
    assert "id" in data["data"]


@pytest.mark.asyncio
async def test_list_projects(client):
    await client.post("/projects", json={"name": "测试项目", "goal": "测试目标"})

    response = await client.get("/projects")
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 0
    assert isinstance(data["data"], list)
    assert len(data["data"]) >= 1


@pytest.mark.asyncio
async def test_get_project(client):
    create_resp = await client.post("/projects", json={"name": "详情测试", "goal": ""})
    project_id = create_resp.json()["data"]["id"]

    response = await client.get(f"/projects/{project_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 0
    assert data["data"]["name"] == "详情测试"


@pytest.mark.asyncio
async def test_update_project(client):
    create_resp = await client.post("/projects", json={"name": "更新前", "goal": ""})
    project_id = create_resp.json()["data"]["id"]

    response = await client.put(
        f"/projects/{project_id}", json={"name": "更新后", "goal": "新目标"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 0
    assert data["data"]["name"] == "更新后"
    assert data["data"]["goal"] == "新目标"


@pytest.mark.asyncio
async def test_delete_project(client):
    create_resp = await client.post("/projects", json={"name": "删除测试", "goal": ""})
    project_id = create_resp.json()["data"]["id"]

    response = await client.delete(f"/projects/{project_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 0

    get_resp = await client.get(f"/projects/{project_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_generate_review_mock(client):
    create_resp = await client.post("/projects", json={"name": "复盘测试", "goal": ""})
    project_id = create_resp.json()["data"]["id"]

    fragment_resp = await client.post(
        "/fragments",
        json={
            "project_id": project_id,
            "raw_content": "发现异常",
            "source_type": "text",
            "status": "active",
            "facts": [{"category": "background", "fact": "DAU 下降 5%"}],
        },
    )
    fragment_id = fragment_resp.json()["data"]["id"]

    mock_content = (
        "[视角 A：汇报模式]\n"
        "针对 DAU 下降 5% 的问题，进行了策略优化。\n\n"
        "[视角 B：简历模式]\n"
        "- 【数据分析】负责定位 DAU 下降原因，推动策略优化。"
    )
    with patch("app.services.review_service.chat_completion", return_value=mock_content):
        response = await client.post(
            f"/projects/{project_id}/generate", json={"fragment_ids": [fragment_id]}
        )
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 0
    assert "DAU 下降 5%" in data["data"]["report_mode"]
    assert "数据分析" in data["data"]["resume_mode"]
