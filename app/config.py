"""
Application Configuration
Environment variables and settings
"""

from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Optional, Union
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "Application Starter Kit"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = "sqlite:///./app.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Allowed Hosts
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1", "0.0.0.0", "*"]
    
    # CORS - stored as string, parsed to list
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:8000,http://localhost:8080,http://localhost:8901,http://127.0.0.1:8901"
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse ALLOWED_ORIGINS string to list"""
        if isinstance(self.ALLOWED_ORIGINS, str):
            return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
        return self.ALLOWED_ORIGINS
    
    # Worker Configuration
    WORKERS: int = 1
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Password hashing
    PWD_SCHEME: str = "bcrypt"
    PWD_DEPRECATED: str = "auto"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
