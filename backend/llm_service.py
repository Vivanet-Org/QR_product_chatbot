import os
from groq import Groq
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class LLMService:
    """
    Service for handling LLM API calls with context-rich prompts using Groq
    """

    def __init__(self):
        # Configure Groq API
        api_key = os.getenv("GROQ_API_KEY")
        self.client = None
        self.use_mock = True

        if api_key:
            try:
                self.client = Groq(api_key=api_key)
                self.use_mock = False
                print("Groq client initialized successfully.")
            except Exception as e:
                print(f"Failed to initialize Groq client: {e}")
                print("Using mock responses for demo.")
                self.client = None
                self.use_mock = True
        else:
            print("Warning: No GROQ_API_KEY found. Using mock responses for demo.")

    def create_context_prompt(self, product_data: Dict[str, Any], user_question: str) -> str:
        """
        Create a context-rich prompt combining product info and user question
        """
        prompt_template = """
You are a helpful product support assistant. Answer the customer's question based on the product information provided below.

PRODUCT INFORMATION:
- Product Name: {product_name}
- Category: {category}
- Manufacturer: {manufacturer}
- Model: {model_number}
- Price: {price}
- Description: {description}
- Specifications: {specs}
- Warranty: {warranty}

FREQUENTLY ASKED QUESTIONS:
{faqs}

CUSTOMER QUESTION: {user_question}

Please provide a helpful, accurate answer based on the product information above. If the information isn't available in the product details, politely explain that you don't have that specific information and suggest contacting customer support.

Keep your response conversational and helpful. If appropriate, reference specific product features or warranty information.
"""

        # Format FAQs for context
        faqs_text = "\n".join([
            f"Q: {faq['question']}\nA: {faq['answer']}\n"
            for faq in product_data.get('faqs', [])
        ])

        return prompt_template.format(
            product_name=product_data.get('name', 'Unknown'),
            category=product_data.get('category', 'N/A'),
            manufacturer=product_data.get('manufacturer', 'N/A'),
            model_number=product_data.get('model_number', 'N/A'),
            price=product_data.get('price', 'N/A'),
            description=product_data.get('short_description', 'N/A'),
            specs=product_data.get('detailed_specs', 'N/A'),
            warranty=product_data.get('warranty_info', 'N/A'),
            faqs=faqs_text or "No FAQs available",
            user_question=user_question
        )

    async def get_response(self, prompt: str) -> str:
        """
        Send prompt to LLM and get response
        """
        if self.use_mock:
            # Return a mock response for demo purposes
            return self._get_mock_response(prompt)

        try:
            response = self.client.chat.completions.create(
                model="llama-3.1-8b-instant",  # Fast Groq model
                messages=[
                    {"role": "system", "content": "You are a helpful product support assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.3
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"I apologize, but I'm having trouble processing your request right now. Please try again later or contact customer support. Error: {str(e)}"

    def _get_mock_response(self, prompt: str) -> str:
        """
        Generate a mock response for demo purposes when no API key is available
        """
        # Extract user question from prompt for better mock responses
        if "CUSTOMER QUESTION:" in prompt:
            user_question = prompt.split("CUSTOMER QUESTION:")[-1].strip().lower()

            if "battery" in user_question:
                return "Based on the product specifications, the battery life is up to 10 hours for typical usage. For gaming or intensive tasks, you can expect 4-6 hours of battery life."
            elif "warranty" in user_question:
                return "This product comes with a 2-year limited warranty covering manufacturing defects. Physical damage and normal wear are not covered. You can contact customer support for warranty claims."
            elif "price" in user_question or "cost" in user_question:
                return "The current price for this product is $1,299.99. Please check our website for any current promotions or discounts that may be available."
            elif "specs" in user_question or "specification" in user_question:
                return "This product features high-end specifications including Intel i7 processor, 16GB RAM, and 512GB SSD storage. For complete technical specifications, please refer to the product manual."
            else:
                return "Thank you for your question! I'd be happy to help you with information about this product. For the most accurate and up-to-date information, please contact our customer support team."

        return "Hello! I'm here to help answer questions about this product. What would you like to know?"