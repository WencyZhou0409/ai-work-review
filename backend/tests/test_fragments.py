import pytest


@pytest.mark.asyncio
async def test_create_fragment(client):
    # 先创建项目
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
async def test_extract_facts_mock(client):
    response = await client.post(
        "/fragments/extract",
        json={"raw_text": "测试文本", "project_id": 1},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 0
    assert "facts" in data["data"]
    assert isinstance(data["data"]["facts"], list)
    assert len(data["data"]["facts"]) > 0
