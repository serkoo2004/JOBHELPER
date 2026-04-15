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
        body = cls._strip_frontmatter(content)
        for line in body.splitlines():
            stripped = line.strip()
            if not stripped:
                continue
            if stripped.startswith("#") or stripped.startswith("-") or stripped.endswith(":"):
                continue
            return stripped
        return ""

    @classmethod
    def get_skill_prompt(cls, skill_name: str) -> str:
        content = cls.get_skill_content(skill_name)
        if not content:
            return ""
        body = cls._strip_frontmatter(content).strip()
        if not body:
            return ""
        return body

    @classmethod
    def render_primary_prompt(cls, skill_name: str, inputs: str) -> str:
        skill_prompt = cls.get_skill_prompt(skill_name)
        if not skill_prompt:
            return inputs.strip()
        return (
            f"PRIMARY SKILL PROMPT\n"
            f"- Asagidaki skill bu gorevin ana talimatidir.\n"
            f"- Cevabi bu skill kurallarina gore uret.\n"
            f"- Kullanici verilerini skill icindeki amaca hizmet edecek sekilde isle.\n"
            f"- Skill ile celisen serbest yorum ekleme.\n\n"
            f"{skill_prompt.strip()}\n\n"
            f"INPUT DATA\n"
            f"{inputs.strip()}"
        ).strip()

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
