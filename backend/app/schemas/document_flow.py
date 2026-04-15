from typing import Any, Literal

from pydantic import BaseModel, Field


FlowIntent = Literal["cv", "cover_letter", "presentation", "spreadsheet"]


class DocumentFlowStartRequest(BaseModel):
    intent: FlowIntent
    profile_id: str | None = None
    context: dict[str, Any] = Field(default_factory=dict)


class DocumentFlowAnswerRequest(BaseModel):
    answer: str


class FlowQuestion(BaseModel):
    key: str
    title: str
    description: str
    input_hint: str | None = None
    choices: list[str] = Field(default_factory=list)


class FlowSummary(BaseModel):
    intent: FlowIntent
    recommended_format: str
    workflow_notes: list[str] = Field(default_factory=list)
    collected_answers: dict[str, str] = Field(default_factory=dict)
    next_actions: list[str] = Field(default_factory=list)


class DocumentFlowResponse(BaseModel):
    session_id: str
    intent: FlowIntent
    completed: bool
    current_step: int
    total_steps: int
    message: str
    question: FlowQuestion | None = None
    summary: FlowSummary | None = None
