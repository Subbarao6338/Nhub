import requests
from bs4 import BeautifulSoup
from api.core.notion.notion_engine import NotionEngine

class ForumCrawler:
    def __init__(self, base_url, engine: NotionEngine):
        self.base_url = base_url
        self.engine = engine

    def scrape_page(self, url):
        # Ported logic from ForumCrawler in to-notion-main
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')

        # Simple extraction logic for integration
        title = soup.title.string if soup.title else "Untitled"
        content = soup.get_text()

        # Ingest to Notion
        self.engine.ingest_content(title, [content], {"url": url})
        return title

def run_scraper(base_url, token, workspace_id):
    engine = NotionEngine(token, workspace_id)
    crawler = ForumCrawler(base_url, engine)
    return crawler.scrape_page(base_url)
