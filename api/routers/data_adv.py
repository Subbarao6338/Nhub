from fastapi import APIRouter, UploadFile, File, HTTPException, Form
import pandas as pd
import io
from sklearn.ensemble import IsolationForest
import numpy as np
from api.core.data_adv.reconcile import reconcile_data
from api.core.data_adv.synthetic import generate_synthetic_data

router = APIRouter()

@router.post("/anomaly-detect")
async def detect_anomalies(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(io.BytesIO(await file.read()))
        numeric_df = df.select_dtypes(include=[np.number]).fillna(0)
        if numeric_df.empty: return {"success": False, "error": "No numeric columns"}
        model = IsolationForest(contamination=0.05).fit(numeric_df)
        preds = model.predict(numeric_df)
        anomalies = df.iloc[np.where(preds == -1)[0]].head(10).to_dict(orient='records')
        return {"success": True, "anomaly_count": len(anomalies), "anomalies": anomalies}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.post("/data-quality")
async def check_quality(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(io.BytesIO(await file.read()))
        return {"success": True, "report": [{"column": c, "missing": int(df[c].isnull().sum()), "unique": int(df[c].nunique())} for c in df.columns]}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.post("/reconcile")
async def run_reconciliation(file1: UploadFile = File(...), file2: UploadFile = File(...), key_column: str = Form(...)):
    try:
        df1 = pd.read_csv(io.BytesIO(await file1.read()))
        df2 = pd.read_csv(io.BytesIO(await file2.read()))
        result = reconcile_data(df1, df2, key_column)
        return {"success": True, "result": result}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-synthetic")
async def generate_synthetic(file: UploadFile = File(...), num_rows: int = Form(100)):
    try:
        df = pd.read_csv(io.BytesIO(await file.read()))
        synthetic_df = generate_synthetic_data(df, num_rows)
        return {"success": True, "data": synthetic_df.to_dict(orient='records')}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))
