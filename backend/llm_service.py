import os
from groq import Groq
from typing import Dict, Any, Tuple, Optional
from dotenv import load_dotenv
from langdetect import detect, LangDetectException
from deep_translator import GoogleTranslator

# Load environment variables
load_dotenv()

class LLMService:
    """
    Service for handling LLM API calls with context-rich prompts using Groq
    with multilingual support
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

        # Language mapping for better detection and translation
        self.language_map = {
            'en': 'english',
            'es': 'spanish',
            'fr': 'french',
            'de': 'german',
            'it': 'italian',
            'pt': 'portuguese',
            'zh-cn': 'chinese (simplified)',
            'zh-tw': 'chinese (traditional)',
            'ja': 'japanese',
            'ko': 'korean',
            'hi': 'hindi',
            'ar': 'arabic',
            'ru': 'russian',
            'nl': 'dutch',
            'pl': 'polish',
            'tr': 'turkish',
            'vi': 'vietnamese',
            'th': 'thai',
            'id': 'indonesian',
            'ms': 'malay'
        }

    def detect_language(self, text: str) -> str:
        """
        Detect the language of the input text
        Returns ISO 639-1 language code (e.g., 'en', 'es', 'fr')
        """
        try:
            detected = detect(text)
            print(f"Detected language: {detected}")
            return detected
        except LangDetectException:
            print("Could not detect language, defaulting to English")
            return 'en'
        except Exception as e:
            print(f"Language detection error: {e}")
            return 'en'

    def translate_text(self, text: str, source_lang: str, target_lang: str) -> str:
        """
        Translate text from source language to target language
        """
        if source_lang == target_lang:
            return text

        try:
            # GoogleTranslator uses 'auto' for automatic detection
            src = 'auto' if source_lang == 'auto' else source_lang
            translator = GoogleTranslator(source=src, target=target_lang)
            translated = translator.translate(text)
            print(f"Translated from {source_lang} to {target_lang}")
            return translated
        except Exception as e:
            print(f"Translation error: {e}")
            return text

    def create_context_prompt(self, product_data: Dict[str, Any], user_question: str,
                            response_language: Optional[str] = None) -> Tuple[str, str]:
        """
        Create a context-rich prompt combining product info and user question
        with language awareness
        Returns: (prompt, detected_language)
        """
        # Detect language of user question
        detected_lang = self.detect_language(user_question) if not response_language else response_language

        # Translate question to English for better LLM understanding
        translated_question = user_question
        if detected_lang != 'en':
            translated_question = self.translate_text(user_question, detected_lang, 'en')
            print(f"Translated question to English: {translated_question}")

        # Get full language name for the prompt
        lang_name = self.language_map.get(detected_lang, detected_lang)

        prompt_template = """
You are a helpful product support assistant. Answer the customer's question based on the product information provided below.

IMPORTANT: The customer asked their question in {language}. You MUST provide your ENTIRE response in {language}. Do not mix languages.

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

CUSTOMER QUESTION (translated to English): {translated_question}
ORIGINAL QUESTION (in {language}): {original_question}

Please provide a helpful, accurate answer in {language}. If the information isn't available in the product details, politely explain in {language} that you don't have that specific information and suggest contacting customer support.

Remember: Your ENTIRE response must be in {language}. Keep your response conversational and helpful.
"""

        # Format FAQs for context
        faqs_text = "\n".join([
            f"Q: {faq['question']}\nA: {faq['answer']}\n"
            for faq in product_data.get('faqs', [])
        ])

        prompt = prompt_template.format(
            language=lang_name,
            product_name=product_data.get('name', 'Unknown'),
            category=product_data.get('category', 'N/A'),
            manufacturer=product_data.get('manufacturer', 'N/A'),
            model_number=product_data.get('model_number', 'N/A'),
            price=product_data.get('price', 'N/A'),
            description=product_data.get('short_description', 'N/A'),
            specs=product_data.get('detailed_specs', 'N/A'),
            warranty=product_data.get('warranty_info', 'N/A'),
            faqs=faqs_text or "No FAQs available",
            translated_question=translated_question,
            original_question=user_question
        )

        return prompt, detected_lang

    async def get_response(self, prompt: str, target_language: str = 'en') -> str:
        """
        Send prompt to LLM and get response, ensuring it's in the target language
        """
        if self.use_mock:
            # Return a mock response for demo purposes
            response = self._get_mock_response(prompt)
            # Translate mock response to target language if needed
            if target_language != 'en':
                response = self.translate_text(response, 'en', target_language)
            return response

        try:
            response = self.client.chat.completions.create(
                model="llama-3.1-8b-instant",  # Fast Groq model
                messages=[
                    {"role": "system", "content": f"You are a helpful product support assistant. Always respond in the language requested by the user."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.3
            )

            llm_response = response.choices[0].message.content.strip()

            # Check if response is in the correct language
            # If the LLM didn't respond in the correct language, translate it
            if target_language != 'en':
                detected_response_lang = self.detect_language(llm_response[:100])  # Check first 100 chars
                if detected_response_lang != target_language:
                    print(f"LLM responded in {detected_response_lang}, translating to {target_language}")
                    llm_response = self.translate_text(llm_response, detected_response_lang, target_language)

            return llm_response

        except Exception as e:
            error_msg = f"I apologize, but I'm having trouble processing your request right now. Please try again later or contact customer support. Error: {str(e)}"
            # Translate error message to target language
            if target_language != 'en':
                error_msg = self.translate_text(error_msg, 'en', target_language)
            return error_msg

    def _get_mock_response(self, prompt: str) -> str:
        """
        Generate a mock response for demo purposes when no API key is available
        """
        # Extract user question from prompt for better mock responses
        if "CUSTOMER QUESTION" in prompt:
            # Check if language is mentioned in prompt
            if "spanish" in prompt.lower():
                return "Gracias por su pregunta. Estaré encantado de ayudarle con información sobre este producto."
            elif "french" in prompt.lower():
                return "Merci pour votre question. Je serais heureux de vous aider avec des informations sur ce produit."
            elif "german" in prompt.lower():
                return "Vielen Dank für Ihre Frage. Ich helfe Ihnen gerne mit Informationen zu diesem Produkt."
            elif "chinese" in prompt.lower():
                return "感谢您的提问！我很乐意为您提供有关此产品的信息。"
            elif "hindi" in prompt.lower():
                return "आपके प्रश्न के लिए धन्यवाद। मैं इस उत्पाद के बारे में जानकारी देने में आपकी मदद करने के लिए खुश हूं।"

            user_question = prompt.split("CUSTOMER QUESTION")[-1].strip().lower()

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