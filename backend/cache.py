"""
Simple in-memory cache with TTL (Time To Live)
"""
import time
from typing import Any, Optional
from functools import wraps
import hashlib
import json

class SimpleCache:
    def __init__(self):
        self._cache = {}
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate a cache key from function arguments"""
        key_parts = [prefix]
        if args:
            key_parts.extend([str(arg) for arg in args])
        if kwargs:
            key_parts.append(json.dumps(kwargs, sort_keys=True))
        key_string = ":".join(key_parts)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache if not expired"""
        if key in self._cache:
            value, expiry = self._cache[key]
            if time.time() < expiry:
                return value
            else:
                # Remove expired entry
                del self._cache[key]
        return None
    
    def set(self, key: str, value: Any, ttl: int = 300):
        """Set value in cache with TTL in seconds (default 5 minutes)"""
        expiry = time.time() + ttl
        self._cache[key] = (value, expiry)
    
    def delete(self, key: str):
        """Delete a specific key from cache"""
        if key in self._cache:
            del self._cache[key]
    
    def clear(self):
        """Clear all cache"""
        self._cache.clear()
    
    def invalidate_pattern(self, pattern: str):
        """Invalidate all keys matching a pattern"""
        keys_to_delete = [key for key in self._cache.keys() if pattern in key]
        for key in keys_to_delete:
            del self._cache[key]

# Global cache instance
cache = SimpleCache()

def cached(ttl: int = 300, key_prefix: str = ""):
    """
    Decorator to cache function results
    
    Args:
        ttl: Time to live in seconds (default 5 minutes)
        key_prefix: Prefix for cache key
    """
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = cache._generate_key(key_prefix or func.__name__, *args, **kwargs)
            
            # Try to get from cache
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Call function and cache result
            result = await func(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            return result
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = cache._generate_key(key_prefix or func.__name__, *args, **kwargs)
            
            # Try to get from cache
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Call function and cache result
            result = func(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            return result
        
        # Return appropriate wrapper based on function type
        import inspect
        if inspect.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator
