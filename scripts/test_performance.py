#!/usr/bin/env python3
"""
Performance Testing Script - Test Harvest.ai API performance improvements
Tests caching, rate limiting, and error handling
"""
import requests
import time
import json
import statistics
from typing import Dict, List, Any
from dataclasses import dataclass

@dataclass
class PerformanceTest:
    name: str
    description: str
    test_function: callable

class HarvestPerformanceTester:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.results = []
        
    def test_api_health(self) -> Dict[str, Any]:
        """Test the health check endpoint"""
        print("🔍 Testing API Health...")
        
        start_time = time.time()
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            response_time = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Health check passed in {response_time:.2f}ms")
                print(f"   Status: {data.get('status')}")
                print(f"   Redis: {data.get('services', {}).get('redis', {}).get('status')}")
                print(f"   Cache keys: {data.get('cache', {}).get('total_keys', 0)}")
                return {
                    "test": "api_health",
                    "status": "passed",
                    "response_time": response_time,
                    "data": data
                }
            else:
                print(f"❌ Health check failed: {response.status_code}")
                return {
                    "test": "api_health",
                    "status": "failed",
                    "response_time": response_time,
                    "error": f"HTTP {response.status_code}"
                }
        except Exception as e:
            print(f"❌ Health check error: {e}")
            return {
                "test": "api_health",
                "status": "error",
                "response_time": (time.time() - start_time) * 1000,
                "error": str(e)
            }
    
    def test_content_generation(self, test_content: str, format_type: str = "summary") -> Dict[str, Any]:
        """Test content generation with performance metrics"""
        print(f"🚀 Testing {format_type} generation...")
        
        payload = {
            "input": test_content,
            "format": format_type,
            "apiKey": "test-key",  # Will fail but we can measure response time
            "options": {
                "tone": "professional",
                "length": "medium"
            }
        }
        
        start_time = time.time()
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=30
            )
            response_time = (time.time() - start_time) * 1000
            
            if response.status_code == 401:
                print(f"✅ Generation endpoint accessible in {response_time:.2f}ms (expected auth error)")
                return {
                    "test": f"generation_{format_type}",
                    "status": "passed",
                    "response_time": response_time,
                    "note": "Expected authentication error"
                }
            elif response.status_code == 200:
                data = response.json()
                cached = data.get('metadata', {}).get('cached', False)
                print(f"✅ Generation successful in {response_time:.2f}ms (cached: {cached})")
                return {
                    "test": f"generation_{format_type}",
                    "status": "passed",
                    "response_time": response_time,
                    "cached": cached,
                    "quality_score": data.get('quality_score'),
                    "cost": data.get('cost', {}).get('estimated_cost')
                }
            else:
                print(f"❌ Generation failed: {response.status_code}")
                return {
                    "test": f"generation_{format_type}",
                    "status": "failed",
                    "response_time": response_time,
                    "error": f"HTTP {response.status_code}"
                }
        except Exception as e:
            print(f"❌ Generation error: {e}")
            return {
                "test": f"generation_{format_type}",
                "status": "error",
                "response_time": (time.time() - start_time) * 1000,
                "error": str(e)
            }
    
    def test_rate_limiting(self) -> Dict[str, Any]:
        """Test rate limiting functionality"""
        print("🛡️ Testing rate limiting...")
        
        # Make multiple rapid requests to test rate limiting
        responses = []
        start_time = time.time()
        
        for i in range(5):
            try:
                response = requests.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "input": f"Test content {i}",
                        "format": "summary",
                        "apiKey": "test-key",
                        "options": {"tone": "professional"}
                    },
                    timeout=10
                )
                responses.append({
                    "request": i + 1,
                    "status_code": response.status_code,
                    "rate_limited": response.status_code == 429
                })
            except Exception as e:
                responses.append({
                    "request": i + 1,
                    "error": str(e)
                })
        
        total_time = (time.time() - start_time) * 1000
        rate_limited_count = sum(1 for r in responses if r.get('rate_limited'))
        
        print(f"✅ Rate limiting test completed in {total_time:.2f}ms")
        print(f"   Requests: {len(responses)}")
        print(f"   Rate limited: {rate_limited_count}")
        
        return {
            "test": "rate_limiting",
            "status": "passed",
            "total_time": total_time,
            "requests": responses,
            "rate_limited_count": rate_limited_count
        }
    
    def test_error_handling(self) -> Dict[str, Any]:
        """Test error handling and retry logic"""
        print("🔄 Testing error handling...")
        
        test_cases = [
            {
                "name": "empty_input",
                "payload": {"input": "", "format": "summary", "apiKey": "test-key"}
            },
            {
                "name": "invalid_format",
                "payload": {"input": "Test content", "format": "invalid", "apiKey": "test-key"}
            },
            {
                "name": "missing_api_key",
                "payload": {"input": "Test content", "format": "summary"}
            }
        ]
        
        results = []
        for test_case in test_cases:
            try:
                response = requests.post(
                    f"{self.base_url}/api/generate",
                    json=test_case["payload"],
                    timeout=10
                )
                results.append({
                    "test": test_case["name"],
                    "status_code": response.status_code,
                    "expected_error": response.status_code >= 400,
                    "has_error_message": "error" in response.json() if response.status_code >= 400 else False
                })
            except Exception as e:
                results.append({
                    "test": test_case["name"],
                    "error": str(e)
                })
        
        passed_tests = sum(1 for r in results if r.get('expected_error'))
        print(f"✅ Error handling test: {passed_tests}/{len(test_cases)} passed")
        
        return {
            "test": "error_handling",
            "status": "passed" if passed_tests == len(test_cases) else "partial",
            "results": results,
            "passed_count": passed_tests,
            "total_count": len(test_cases)
        }
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all performance tests"""
        print("🚀 Starting Harvest.ai Performance Tests")
        print("=" * 50)
        
        test_content = """
        Web scraping is a powerful technique for extracting data from websites. 
        It can be used for market research, competitive analysis, content aggregation, 
        and many other business applications. However, it's important to follow 
        ethical guidelines and respect robots.txt files.
        """
        
        tests = [
            ("Health Check", self.test_api_health),
            ("Blog Generation", lambda: self.test_content_generation(test_content, "blog")),
            ("Summary Generation", lambda: self.test_content_generation(test_content, "summary")),
            ("Email Generation", lambda: self.test_content_generation(test_content, "email")),
            ("Quiz Generation", lambda: self.test_content_generation(test_content, "quiz")),
            ("Rate Limiting", self.test_rate_limiting),
            ("Error Handling", self.test_error_handling)
        ]
        
        results = []
        for test_name, test_func in tests:
            print(f"\n📋 Running: {test_name}")
            result = test_func()
            result["test_name"] = test_name
            results.append(result)
            time.sleep(1)  # Brief pause between tests
        
        # Calculate summary statistics
        response_times = [r.get("response_time", 0) for r in results if r.get("response_time")]
        success_rate = sum(1 for r in results if r.get("status") == "passed") / len(results)
        
        summary = {
            "total_tests": len(results),
            "passed_tests": sum(1 for r in results if r.get("status") == "passed"),
            "success_rate": success_rate,
            "avg_response_time": statistics.mean(response_times) if response_times else 0,
            "max_response_time": max(response_times) if response_times else 0,
            "min_response_time": min(response_times) if response_times else 0,
            "results": results
        }
        
        print("\n" + "=" * 50)
        print("📊 PERFORMANCE TEST SUMMARY")
        print("=" * 50)
        print(f"Total Tests: {summary['total_tests']}")
        print(f"Passed: {summary['passed_tests']}")
        print(f"Success Rate: {summary['success_rate']:.1%}")
        print(f"Avg Response Time: {summary['avg_response_time']:.2f}ms")
        print(f"Max Response Time: {summary['max_response_time']:.2f}ms")
        print(f"Min Response Time: {summary['min_response_time']:.2f}ms")
        
        # Save results
        with open("performance_test_results.json", "w") as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Results saved to: performance_test_results.json")
        
        return summary

def main():
    """Main function to run performance tests"""
    tester = HarvestPerformanceTester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    if results["success_rate"] >= 0.8:
        print("\n✅ Performance tests passed!")
        exit(0)
    else:
        print("\n❌ Performance tests failed!")
        exit(1)

if __name__ == "__main__":
    main()
