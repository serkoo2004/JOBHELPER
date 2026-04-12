from pathlib import Path


class AiSkillManager:
    SKILL_DIR = Path(__file__).resolve().parents[3] / 'ai' / 'skills'

    @classmethod
    def get_skill_content(cls, skill_name: str) -> str:
        skill_path = cls.SKILL_DIR / f"{skill_name}.md"
        if not skill_path.exists():
            return ""
        return skill_path.read_text(encoding='utf-8')

    @classmethod
    def get_skill_intro(cls, skill_name: str) -> str:
        content = cls.get_skill_content(skill_name)
        if not content:
            return ''

        return cls._strip_frontmatter(content).splitlines()[0].strip() if cls._strip_frontmatter(content).splitlines() else ''

    @classmethod
    def get_skill_prompt(cls, skill_name: str) -> str:
        content = cls.get_skill_content(skill_name)
        if not content:
            return ""
        body = cls._strip_frontmatter(content).strip()
        if not body:
            return ""
        return f"Skill Instructions - {skill_name}:\n{body}\n"

    @staticmethod
    def _strip_frontmatter(content: str) -> str:
        lines = content.splitlines()
        in_frontmatter = False
        body_lines: list[str] = []
        for line in lines:
            stripped = line.strip()
            if stripped == '---':
                in_frontmatter = not in_frontmatter
                continue
            if in_frontmatter:
                continue
            body_lines.append(line)
        return "\n".join(body_lines).strip()
