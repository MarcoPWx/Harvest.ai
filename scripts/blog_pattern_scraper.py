#!/usr/bin/env python3
"""
Blog Pattern Scraper - Analyze blog post structures from popular platforms
Uses Harvest.ai's legal compliance framework for ethical scraping
"""

import json
import time
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse, urljoin
from dataclasses import dataclass
import sys
import os

# Add src to path for legal_compliance import
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

try:
    from legal_compliance import LegalComplianceEngine
except ImportError:
    # Fallback for when running from scripts directory
    import sys
    sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))
    from legal_compliance import LegalComplianceEngine
import requests
from bs4 import BeautifulSoup

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class BlogPattern:
    """Represents a blog post pattern analysis"""
    platform: str
    url: str
    title_pattern: Dict[str, any]
    section_structure: Dict[str, any]
    content_patterns: Dict[str, any]
    seo_patterns: Dict[str, any]
    engagement_metrics: Dict[str, any]
    scraped_at: datetime


class BlogPatternScraper:
    """Scrapes and analyzes blog post patterns from popular platforms"""
    
    def __init__(self):
        self.compliance = LegalComplianceEngine()
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Harvest.ai/1.0 Blog Pattern Analyzer (https://harvest.ai; legal@harvest.ai)"
        })
        
        # Target platforms for blog analysis
        self.platforms = {
            "medium": {
                "base_url": "https://medium.com",
                "topics_url": "https://medium.com/topics",
                "article_pattern": "https://medium.com/*/*",
                "allowed": True  # We'll check compliance per URL
            },
            "dev_to": {
                "base_url": "https://dev.to",
                "topics_url": "https://dev.to/tags",
                "article_pattern": "https://dev.to/*/*",
                "allowed": True
            },
            "hashnode": {
                "base_url": "https://hashnode.com",
                "topics_url": "https://hashnode.com/topics",
                "article_pattern": "https://hashnode.com/*/*",
                "allowed": True
            }
        }
        
        self.patterns = []
        
    def scrape_blog_patterns(self, max_articles_per_platform: int = 10) -> List[BlogPattern]:
        """Scrape blog post patterns from all platforms"""
        logger.info("Starting blog pattern analysis...")
        
        for platform_name, platform_config in self.platforms.items():
            logger.info(f"Analyzing {platform_name}...")
            
            try:
                # Check compliance for the platform
                allowed, info = self.compliance.check_compliance(platform_config["topics_url"])
                
                if not allowed:
                    logger.warning(f"Skipping {platform_name}: {info.get('message', 'Not allowed')}")
                    continue
                
                # Get popular topics/categories
                topics = self._get_popular_topics(platform_config["topics_url"])
                
                # Analyze articles from each topic
                for topic in topics[:3]:  # Limit to 3 topics per platform
                    articles = self._get_articles_from_topic(topic, max_articles_per_platform // 3)
                    
                    for article_url in articles:
                        pattern = self._analyze_article_pattern(platform_name, article_url)
                        if pattern:
                            self.patterns.append(pattern)
                            
                        # Respect rate limits
                        time.sleep(2)
                        
            except Exception as e:
                logger.error(f"Error analyzing {platform_name}: {e}")
                continue
                
        logger.info(f"Completed analysis. Found {len(self.patterns)} patterns.")
        return self.patterns
    
    def _get_popular_topics(self, topics_url: str) -> List[str]:
        """Get popular topics/categories from a platform"""
        try:
            response = self.session.get(topics_url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract topic URLs (this will need platform-specific selectors)
            topics = []
            
            # Generic approach - look for links that might be topics
            for link in soup.find_all('a', href=True):
                href = link['href']
                if '/tag/' in href or '/topic/' in href or '/category/' in href:
                    full_url = urljoin(topics_url, href)
                    topics.append(full_url)
                    
            return topics[:10]  # Limit to 10 topics
            
        except Exception as e:
            logger.error(f"Error getting topics from {topics_url}: {e}")
            return []
    
    def _get_articles_from_topic(self, topic_url: str, max_articles: int) -> List[str]:
        """Get article URLs from a specific topic"""
        try:
            response = self.session.get(topic_url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            articles = []
            
            # Look for article links
            for link in soup.find_all('a', href=True):
                href = link['href']
                if self._is_article_url(href):
                    full_url = urljoin(topic_url, href)
                    articles.append(full_url)
                    
                    if len(articles) >= max_articles:
                        break
                        
            return articles
            
        except Exception as e:
            logger.error(f"Error getting articles from {topic_url}: {e}")
            return []
    
    def _is_article_url(self, href: str) -> bool:
        """Check if a URL looks like an article"""
        article_indicators = [
            '/p/',  # Medium
            '/@',   # Medium author
            '/dev.to/',  # Dev.to
            '/hashnode.dev/',  # Hashnode
            '/post/',  # Generic
            '/article/',  # Generic
            '/blog/',  # Generic
        ]
        
        return any(indicator in href for indicator in article_indicators)
    
    def _analyze_article_pattern(self, platform: str, article_url: str) -> Optional[BlogPattern]:
        """Analyze the structure of a single article"""
        try:
            # Check compliance for this specific article
            allowed, info = self.compliance.check_compliance(article_url)
            
            if not allowed:
                logger.warning(f"Skipping article {article_url}: {info.get('message', 'Not allowed')}")
                return None
            
            # Scrape the article content
            content = self.compliance.scrape_content(article_url)
            
            # Parse with BeautifulSoup for structure analysis
            soup = BeautifulSoup(content, 'html.parser')
            
            # Extract patterns
            title_pattern = self._extract_title_pattern(soup)
            section_structure = self._extract_section_structure(soup)
            content_patterns = self._extract_content_patterns(soup)
            seo_patterns = self._extract_seo_patterns(soup)
            engagement_metrics = self._extract_engagement_metrics(soup)
            
            return BlogPattern(
                platform=platform,
                url=article_url,
                title_pattern=title_pattern,
                section_structure=section_structure,
                content_patterns=content_patterns,
                seo_patterns=seo_patterns,
                engagement_metrics=engagement_metrics,
                scraped_at=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error analyzing article {article_url}: {e}")
            return None
    
    def _extract_title_pattern(self, soup: BeautifulSoup) -> Dict[str, any]:
        """Extract title patterns and characteristics"""
        title = soup.find('title')
        h1 = soup.find('h1')
        
        title_text = title.get_text() if title else ""
        h1_text = h1.get_text() if h1 else ""
        
        return {
            "title_length": len(title_text),
            "h1_length": len(h1_text),
            "title_format": self._classify_title_format(title_text),
            "has_numbers": any(char.isdigit() for char in title_text),
            "has_colon": ":" in title_text,
            "has_dash": "-" in title_text,
            "word_count": len(title_text.split()),
            "common_words": self._extract_common_words(title_text)
        }
    
    def _extract_section_structure(self, soup: BeautifulSoup) -> Dict[str, any]:
        """Extract section structure patterns"""
        headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        
        section_types = []
        for heading in headings:
            text = heading.get_text().lower()
            if any(word in text for word in ['introduction', 'intro', 'overview']):
                section_types.append('introduction')
            elif any(word in text for word in ['conclusion', 'summary', 'wrap']):
                section_types.append('conclusion')
            elif any(word in text for word in ['problem', 'challenge', 'issue']):
                section_types.append('problem')
            elif any(word in text for word in ['solution', 'answer', 'fix']):
                section_types.append('solution')
            elif any(word in text for word in ['example', 'case', 'demo']):
                section_types.append('example')
            else:
                section_types.append('content')
        
        return {
            "total_headings": len(headings),
            "heading_hierarchy": [h.name for h in headings],
            "section_types": section_types,
            "has_introduction": 'introduction' in section_types,
            "has_conclusion": 'conclusion' in section_types,
            "avg_section_length": len(headings) / max(len(section_types), 1)
        }
    
    def _extract_content_patterns(self, soup: BeautifulSoup) -> Dict[str, any]:
        """Extract content patterns"""
        paragraphs = soup.find_all('p')
        lists = soup.find_all(['ul', 'ol'])
        code_blocks = soup.find_all(['code', 'pre'])
        images = soup.find_all('img')
        
        return {
            "paragraph_count": len(paragraphs),
            "avg_paragraph_length": sum(len(p.get_text().split()) for p in paragraphs) / max(len(paragraphs), 1),
            "list_count": len(lists),
            "code_block_count": len(code_blocks),
            "image_count": len(images),
            "has_call_to_action": self._has_call_to_action(soup),
            "content_density": len(soup.get_text().split()) / max(len(paragraphs), 1)
        }
    
    def _extract_seo_patterns(self, soup: BeautifulSoup) -> Dict[str, any]:
        """Extract SEO-related patterns"""
        meta_description = soup.find('meta', attrs={'name': 'description'})
        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        canonical = soup.find('link', attrs={'rel': 'canonical'})
        
        return {
            "has_meta_description": meta_description is not None,
            "meta_description_length": len(meta_description.get('content', '')) if meta_description else 0,
            "has_meta_keywords": meta_keywords is not None,
            "has_canonical": canonical is not None,
            "heading_structure": self._analyze_heading_structure(soup)
        }
    
    def _extract_engagement_metrics(self, soup: BeautifulSoup) -> Dict[str, any]:
        """Extract engagement-related patterns"""
        # Look for social sharing buttons, comments, etc.
        social_buttons = soup.find_all(['button', 'a'], class_=lambda x: x and any(word in x.lower() for word in ['share', 'social', 'twitter', 'facebook']))
        comment_sections = soup.find_all(['div', 'section'], class_=lambda x: x and any(word in x.lower() for word in ['comment', 'discussion']))
        
        return {
            "has_social_sharing": len(social_buttons) > 0,
            "has_comments": len(comment_sections) > 0,
            "social_button_count": len(social_buttons),
            "comment_section_count": len(comment_sections)
        }
    
    def _classify_title_format(self, title: str) -> str:
        """Classify the format of a title"""
        title_lower = title.lower()
        
        if any(word in title_lower for word in ['how to', 'guide', 'tutorial']):
            return 'how-to'
        elif any(word in title_lower for word in ['best', 'top', 'ultimate']):
            return 'listicle'
        elif any(word in title_lower for word in ['why', 'what', 'when', 'where']):
            return 'question'
        elif any(word in title_lower for word in ['case study', 'example', 'story']):
            return 'case-study'
        else:
            return 'general'
    
    def _extract_common_words(self, text: str) -> List[str]:
        """Extract common words from text"""
        # Simple word frequency analysis
        words = text.lower().split()
        word_freq = {}
        
        for word in words:
            if len(word) > 3:  # Skip short words
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Return top 5 most common words
        return sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:5]
    
    def _has_call_to_action(self, soup: BeautifulSoup) -> bool:
        """Check if content has call-to-action elements"""
        cta_indicators = [
            'subscribe', 'download', 'sign up', 'get started', 'learn more',
            'read more', 'click here', 'try now', 'join us', 'contact us'
        ]
        
        text = soup.get_text().lower()
        return any(indicator in text for indicator in cta_indicators)
    
    def _analyze_heading_structure(self, soup: BeautifulSoup) -> Dict[str, any]:
        """Analyze heading structure for SEO"""
        headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        
        structure = {}
        for heading in headings:
            level = heading.name
            if level not in structure:
                structure[level] = 0
            structure[level] += 1
        
        return structure
    
    def save_patterns(self, filename: str = "blog_patterns.json"):
        """Save patterns to JSON file"""
        patterns_data = []
        
        for pattern in self.patterns:
            pattern_dict = {
                "platform": pattern.platform,
                "url": pattern.url,
                "title_pattern": pattern.title_pattern,
                "section_structure": pattern.section_structure,
                "content_patterns": pattern.content_patterns,
                "seo_patterns": pattern.seo_patterns,
                "engagement_metrics": pattern.engagement_metrics,
                "scraped_at": pattern.scraped_at.isoformat()
            }
            patterns_data.append(pattern_dict)
        
        with open(filename, 'w') as f:
            json.dump(patterns_data, f, indent=2)
        
        logger.info(f"Saved {len(patterns_data)} patterns to {filename}")
    
    def generate_insights(self) -> Dict[str, any]:
        """Generate insights from collected patterns"""
        if not self.patterns:
            return {"error": "No patterns collected"}
        
        insights = {
            "total_patterns": len(self.patterns),
            "platforms_analyzed": list(set(p.platform for p in self.patterns)),
            "title_insights": self._analyze_title_insights(),
            "section_insights": self._analyze_section_insights(),
            "content_insights": self._analyze_content_insights(),
            "seo_insights": self._analyze_seo_insights(),
            "engagement_insights": self._analyze_engagement_insights()
        }
        
        return insights
    
    def _analyze_title_insights(self) -> Dict[str, any]:
        """Analyze title patterns across all articles"""
        titles = [p.title_pattern for p in self.patterns]
        
        return {
            "avg_title_length": sum(t["title_length"] for t in titles) / len(titles),
            "avg_word_count": sum(t["word_count"] for t in titles) / len(titles),
            "format_distribution": self._count_formats([t["title_format"] for t in titles]),
            "has_numbers_percentage": sum(1 for t in titles if t["has_numbers"]) / len(titles) * 100,
            "has_colon_percentage": sum(1 for t in titles if t["has_colon"]) / len(titles) * 100
        }
    
    def _analyze_section_insights(self) -> Dict[str, any]:
        """Analyze section structure patterns"""
        sections = [p.section_structure for p in self.patterns]
        
        return {
            "avg_headings": sum(s["total_headings"] for s in sections) / len(sections),
            "has_intro_percentage": sum(1 for s in sections if s["has_introduction"]) / len(sections) * 100,
            "has_conclusion_percentage": sum(1 for s in sections if s["has_conclusion"]) / len(sections) * 100,
            "avg_section_length": sum(s["avg_section_length"] for s in sections) / len(sections)
        }
    
    def _analyze_content_insights(self) -> Dict[str, any]:
        """Analyze content patterns"""
        contents = [p.content_patterns for p in self.patterns]
        
        return {
            "avg_paragraphs": sum(c["paragraph_count"] for c in contents) / len(contents),
            "avg_paragraph_length": sum(c["avg_paragraph_length"] for c in contents) / len(contents),
            "has_cta_percentage": sum(1 for c in contents if c["has_call_to_action"]) / len(contents) * 100,
            "avg_lists": sum(c["list_count"] for c in contents) / len(contents),
            "avg_code_blocks": sum(c["code_block_count"] for c in contents) / len(contents)
        }
    
    def _analyze_seo_insights(self) -> Dict[str, any]:
        """Analyze SEO patterns"""
        seo_patterns = [p.seo_patterns for p in self.patterns]
        
        return {
            "has_meta_desc_percentage": sum(1 for s in seo_patterns if s["has_meta_description"]) / len(seo_patterns) * 100,
            "avg_meta_desc_length": sum(s["meta_description_length"] for s in seo_patterns) / len(seo_patterns),
            "has_canonical_percentage": sum(1 for s in seo_patterns if s["has_canonical"]) / len(seo_patterns) * 100
        }
    
    def _analyze_engagement_insights(self) -> Dict[str, any]:
        """Analyze engagement patterns"""
        engagement = [p.engagement_metrics for p in self.patterns]
        
        return {
            "has_social_percentage": sum(1 for e in engagement if e["has_social_sharing"]) / len(engagement) * 100,
            "has_comments_percentage": sum(1 for e in engagement if e["has_comments"]) / len(engagement) * 100,
            "avg_social_buttons": sum(e["social_button_count"] for e in engagement) / len(engagement)
        }
    
    def _count_formats(self, formats: List[str]) -> Dict[str, int]:
        """Count format distribution"""
        format_counts = {}
        for format_type in formats:
            format_counts[format_type] = format_counts.get(format_type, 0) + 1
        return format_counts


def main():
    """Main function to run the blog pattern scraper"""
    scraper = BlogPatternScraper()
    
    print("🌐 Starting Blog Pattern Analysis...")
    print("=" * 50)
    
    # Scrape patterns
    patterns = scraper.scrape_blog_patterns(max_articles_per_platform=5)
    
    if patterns:
        # Save patterns
        scraper.save_patterns("blog_patterns.json")
        
        # Generate insights
        insights = scraper.generate_insights()
        
        print("\n📊 Analysis Complete!")
        print(f"Total patterns analyzed: {insights['total_patterns']}")
        print(f"Platforms: {', '.join(insights['platforms_analyzed'])}")
        
        print("\n🎯 Key Insights:")
        print(f"Average title length: {insights['title_insights']['avg_title_length']:.1f} characters")
        print(f"Average word count: {insights['title_insights']['avg_word_count']:.1f} words")
        print(f"Articles with introductions: {insights['section_insights']['has_intro_percentage']:.1f}%")
        print(f"Articles with conclusions: {insights['section_insights']['has_conclusion_percentage']:.1f}%")
        print(f"Articles with CTAs: {insights['content_insights']['has_cta_percentage']:.1f}%")
        
        # Save insights
        with open("blog_pattern_insights.json", 'w') as f:
            json.dump(insights, f, indent=2)
        
        print(f"\n💾 Results saved to:")
        print("- blog_patterns.json (raw patterns)")
        print("- blog_pattern_insights.json (analysis)")
        
    else:
        print("❌ No patterns were collected. Check compliance settings.")


if __name__ == "__main__":
    main()
