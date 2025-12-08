from sqlalchemy.types import TypeDecorator, String
from app.utils.crypto import decrypt_str, encrypt_str

class EncryptedString(TypeDecorator):
    impl = String(512) 

    def process_bind_param(self, value, dialect):
        if value:
            return encrypt_str(value) 
        else:
            return None

    def process_result_value(self, value, dialect):
        if value:
            return decrypt_str(value) 
        else:
            return None