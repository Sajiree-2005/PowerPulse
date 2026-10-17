from typing import Literal, Optional
from pydantic import BaseModel, Field, ConfigDict

class ForecastRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    model: Literal["lstm", "mlp", "both"] = "both"
    horizon: Literal[6, 12, 24] = 24
    buildingId: Optional[str] = "102"
    thresholdKw: float = Field(default=550, gt=0, le=1_000_000)

class DataPoint(BaseModel):
    timestamp: str
    time: str
    actualDemand: Optional[float] = None
    lstmDemand: Optional[float] = None
    mlpDemand: Optional[float] = None
    baselineDemand: Optional[float] = None
    upperConfidence: Optional[float] = None
    lowerConfidence: Optional[float] = None
    isForecast: bool = False
