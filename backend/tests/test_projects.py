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
    # 先创建一个项目
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

    response = await client.post(
        f"/projects/{project_id}/generate", json={"fragment_ids": []}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 0
    assert "report_mode" in data["data"]
    assert "resume_mode" in data["data"]
