from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import json
from app.auth.security import get_current_user
from app.models import User
import smtplib
from email.mime.text import MIMEText

router = APIRouter(prefix="/settings", tags=["settings"])

CONFIG_PATH = "backend/smtp_config.json"

class SmtpConfigSchema(BaseModel):
    smtp_host: str
    smtp_port: int = 587
    smtp_user: str
    smtp_password: str
    smtp_from: str

class SmtpTestRequest(BaseModel):
    test_email: EmailStr

def load_smtp_config():
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "smtp_host": "",
        "smtp_port": 587,
        "smtp_user": "",
        "smtp_password": "",
        "smtp_from": "no-reply@scalpdiagnostix.com"
    }

def save_smtp_config(config):
    with open(CONFIG_PATH, "w") as f:
        json.dump(config, f, indent=4)

@router.get("/smtp")
def get_smtp_settings(current_user: User = Depends(get_current_user)):
    config = load_smtp_config()
    # Mask password for security
    masked_config = config.copy()
    if masked_config.get("smtp_password"):
        masked_config["smtp_password"] = "*****"
    return masked_config

@router.put("/smtp")
def update_smtp_settings(data: SmtpConfigSchema, current_user: User = Depends(get_current_user)):
    # If password is masked and exists, keep the existing one
    existing = load_smtp_config()
    config_dict = data.model_dump()
    if config_dict["smtp_password"] == "*****":
        config_dict["smtp_password"] = existing.get("smtp_password", "")
    save_smtp_config(config_dict)
    return {"detail": "SMTP configurations saved successfully."}

@router.post("/smtp/test")
def test_smtp_connection(data: SmtpTestRequest, current_user: User = Depends(get_current_user)):
    config = load_smtp_config()
    host = config.get("smtp_host")
    port = config.get("smtp_port", 587)
    user = config.get("smtp_user")
    password = config.get("smtp_password")
    sender = config.get("smtp_from", "no-reply@scalpdiagnostix.com")
    
    if not host or not user or not password:
        raise HTTPException(
            status_code=400,
            detail="SMTP configurations are incomplete. Please save host, username, and password first."
        )
        
    try:
        msg = MIMEText("This is a test email from the ScalpDiagnostix AI System confirming your SMTP mail configuration works successfully!")
        msg['Subject'] = "ScalpDiagnostix - SMTP Connection Test"
        msg['From'] = sender
        msg['To'] = data.test_email
        
        server = smtplib.SMTP(host, port)
        server.starttls()
        server.login(user, password)
        server.sendmail(sender, data.test_email, msg.as_string())
        server.quit()
        return {"detail": "Test email sent successfully! Please check your inbox."}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Connection test failed: {e}"
        )
