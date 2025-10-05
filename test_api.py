#!/usr/bin/env python3
"""
Test script for KMRL Induction API
"""

import requests
import json

def test_api():
    """Test the KMRL induction API endpoints"""
    base_url = "http://localhost:3000"
    
    print("🧪 Testing KMRL Induction API")
    print("=" * 40)
    
    try:
        # Test GET endpoint
        print("📡 Testing GET /api/operator/induction...")
        response = requests.get(f"{base_url}/api/operator/induction")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ GET Request successful!")
            print(f"   Fleet Summary: {data['data']['fleet_summary']['total_trainsets']} trainsets")
            print(f"   Models Active: {len(data['data']['model_status'])}")
            print(f"   Top Trainsets: {len(data['data']['top_trainsets'])}")
        else:
            print(f"❌ GET Request failed: {response.status_code}")
        
        print()
        
        # Test POST endpoint
        print("📡 Testing POST /api/operator/induction...")
        post_data = {
            "action": "comprehensive_analysis"
        }
        
        print("   Running comprehensive analysis...")
        response = requests.post(
            f"{base_url}/api/operator/induction", 
            json=post_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ POST Request successful!")
            print(f"   Analysis: {data['action']}")
            print(f"   Models Used: {data['result']['models_used']}")
            print(f"   Processing Time: {data['result']['processing_time']}")
        else:
            print(f"❌ POST Request failed: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed! Make sure the server is running:")
        print("   npm run dev")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_api()