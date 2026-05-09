"""Smoke tests for sprint-agent CLI."""

import pytest

import sprint_agent


def run_cli(monkeypatch, capsys, *args):
    """Invoke sprint_agent.main() with patched sys.argv. Returns captured (stdout, stderr)."""
    monkeypatch.setattr("sys.argv", ["sprint-agent", *args])
    sprint_agent.main()
    return capsys.readouterr()


@pytest.fixture
def in_tmp_project(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    return tmp_path


def test_version_string():
    assert sprint_agent.__version__ == "0.4.0"


def test_init_creates_expected_files(in_tmp_project, monkeypatch, capsys):
    out = run_cli(monkeypatch, capsys, "init", "--name", "MyProj", "--daily", "30", "--days", "5", "--agent", "claude")
    assert "Initializing" in out.out
    assert (in_tmp_project / ".sprint").is_dir()
    assert (in_tmp_project / ".sprint" / "config.yaml").is_file()
    assert (in_tmp_project / ".sprint" / "backlog.md").is_file()
    assert (in_tmp_project / ".sprint" / "AGENT.md").is_file()
    assert (in_tmp_project / "CLAUDE.md").is_file()
    sprints = list((in_tmp_project / ".sprint" / "sprints").glob("S01_*.md"))
    assert len(sprints) == 1


def test_init_idempotent_without_force(in_tmp_project, monkeypatch, capsys):
    run_cli(monkeypatch, capsys, "init")
    out = run_cli(monkeypatch, capsys, "init")
    assert "already exists" in out.out


def test_init_force_overwrites(in_tmp_project, monkeypatch, capsys):
    run_cli(monkeypatch, capsys, "init", "--name", "First")
    out = run_cli(monkeypatch, capsys, "init", "--name", "Second", "--force")
    assert "Initializing" in out.out
    config_text = (in_tmp_project / ".sprint" / "config.yaml").read_text()
    assert "Second" in config_text


def test_init_auto_creates_multi_agent_files(in_tmp_project, monkeypatch, capsys):
    run_cli(monkeypatch, capsys, "init", "--agent", "auto")
    assert (in_tmp_project / ".cursorrules").is_file()
    assert (in_tmp_project / "AGENTS.md").is_file()
    assert (in_tmp_project / "CLAUDE.md").is_file()


def test_status_after_init_shows_sprint(in_tmp_project, monkeypatch, capsys):
    run_cli(monkeypatch, capsys, "init")
    out = run_cli(monkeypatch, capsys, "status")
    assert "Sprint" in out.out
    assert "S01" in out.out


def test_status_without_init_warns(in_tmp_project, monkeypatch, capsys):
    out = run_cli(monkeypatch, capsys, "status")
    assert "No sprint found" in out.out


def test_daily_alias_works(in_tmp_project, monkeypatch, capsys):
    run_cli(monkeypatch, capsys, "init")
    out = run_cli(monkeypatch, capsys, "daily")
    assert "S01" in out.out


def test_backlog_add_creates_ticket(in_tmp_project, monkeypatch, capsys):
    run_cli(monkeypatch, capsys, "init")
    out = run_cli(monkeypatch, capsys, "backlog", "add", "Fix auth", "--priority", "P1", "--effort", "S")
    assert "T-001" in out.out
    backlog = (in_tmp_project / ".sprint" / "backlog.md").read_text()
    assert "T-001" in backlog
    assert "Fix auth" in backlog
    assert "P1" in backlog


def test_backlog_add_increments_ids(in_tmp_project, monkeypatch, capsys):
    run_cli(monkeypatch, capsys, "init")
    run_cli(monkeypatch, capsys, "backlog", "add", "First")
    out = run_cli(monkeypatch, capsys, "backlog", "add", "Second")
    assert "T-002" in out.out


def test_backlog_list_outputs_backlog(in_tmp_project, monkeypatch, capsys):
    run_cli(monkeypatch, capsys, "init")
    run_cli(monkeypatch, capsys, "backlog", "add", "Test ticket")
    out = run_cli(monkeypatch, capsys, "backlog", "list")
    assert "Test ticket" in out.out


def test_sprint_new_increments_sprint_id(in_tmp_project, monkeypatch, capsys):
    run_cli(monkeypatch, capsys, "init")
    out = run_cli(monkeypatch, capsys, "sprint", "new", "--goal", "Ship MVP")
    assert "S02" in out.out
    sprints = sorted((in_tmp_project / ".sprint" / "sprints").glob("S*.md"))
    assert len(sprints) == 2


def test_retro_creates_retro_file(in_tmp_project, monkeypatch, capsys):
    run_cli(monkeypatch, capsys, "init")
    out = run_cli(monkeypatch, capsys, "retro")
    assert "Created retro" in out.out
    retros = list((in_tmp_project / ".sprint" / "retros").glob("RETRO_*.md"))
    assert len(retros) == 1


def test_config_outputs_settings(in_tmp_project, monkeypatch, capsys):
    run_cli(monkeypatch, capsys, "init", "--daily", "45", "--days", "4")
    out = run_cli(monkeypatch, capsys, "config")
    assert "45" in out.out
    assert "4" in out.out


def test_count_checkboxes():
    content = "- [x] done\n- [ ] todo\n- [X] also done\n- [ ] another"
    done, todo = sprint_agent.count_checkboxes(content)
    assert done == 2
    assert todo == 2


def test_progress_bar_zero_total():
    bar = sprint_agent.progress_bar(0, 0)
    assert "░" in bar
