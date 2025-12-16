def mask_email(email: str) -> str:
    """Mask email address for logging (e.g., user@example.com -> u***@example.com)
    
    Args:
        email: The email address to mask
        
    Returns:
        Masked email address with only first and last character of local part visible
    """
    if not email or "@" not in email:
        return email
    parts = email.split("@")
    if len(parts[0]) <= 2:
        return f"{parts[0][0]}***@{parts[1]}"
    return f"{parts[0][0]}{'*' * (len(parts[0]) - 2)}{parts[0][-1]}@{parts[1]}"


def mask_token(token: str) -> str:
    """Mask token for logging (show first 4 and last 4 characters)
    
    Args:
        token: The token to mask
        
    Returns:
        Masked token showing only first 4 and last 4 characters
    """
    if not token or len(token) <= 8:
        return "***"
    return f"{token[:4]}...{token[-4:]}"

