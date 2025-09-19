import qrcode
import os

def generate_product_qr(product_id, base_url="https://yourdomain.com", save_path="./"):
    """
    Generate QR code for a product with product ID and save as PNG

    Args:
        product_id (int): The product ID to encode
        base_url (str): The base URL for your application
        save_path (str): Directory to save the QR code image
    """
    # Create the URL that will be encoded in the QR code
    url = f"{base_url}/?product_id={product_id}"

    # Create QR code instance
    qr = qrcode.QRCode(
        version=1,  # Controls the size of the QR Code
        error_correction=qrcode.constants.ERROR_CORRECT_L,  # About 7% error correction
        box_size=10,  # Size of each box in pixels
        border=4,  # Size of the border (minimum is 4)
    )

    # Add data to the QR code
    qr.add_data(url)
    qr.make(fit=True)

    # Create QR code image
    qr_img = qr.make_image(fill_color="black", back_color="white")

    # Save the image
    filename = f"product_{product_id}_qr.png"
    filepath = os.path.join(save_path, filename)
    qr_img.save(filepath)

    print(f"QR code saved as {filepath}")
    print(f"QR code URL: {url}")
    return filepath

def generate_multiple_qr_codes(product_ids, base_url="https://yourdomain.com", save_path="./"):
    """
    Generate QR codes for multiple products

    Args:
        product_ids (list): List of product IDs
        base_url (str): The base URL for your application
        save_path (str): Directory to save the QR code images
    """
    created_files = []

    for product_id in product_ids:
        try:
            filepath = generate_product_qr(product_id, base_url, save_path)
            created_files.append(filepath)
        except Exception as e:
            print(f"Error generating QR code for product {product_id}: {e}")

    print(f"\nGenerated {len(created_files)} QR codes successfully!")
    return created_files

if __name__ == "__main__":
    # Example usage
    print("QR Code Generator for Product Chatbot")
    print("=====================================")

    # Generate QR codes for sample products
    sample_product_ids = [1, 2]  # Corresponds to the sample data

    # Create a qr_codes directory if it doesn't exist
    qr_dir = "qr_codes"
    if not os.path.exists(qr_dir):
        os.makedirs(qr_dir)

    # For development, use localhost
    dev_base_url = "http://localhost:3000"

    print(f"Generating QR codes for products: {sample_product_ids}")
    print(f"Base URL: {dev_base_url}")
    print(f"Save directory: {qr_dir}")
    print()

    generate_multiple_qr_codes(sample_product_ids, dev_base_url, qr_dir)

    print("\nTo use these QR codes:")
    print("1. Start your React app (npm start)")
    print("2. Start your FastAPI backend (uvicorn main:app --reload)")
    print("3. Use any QR code scanner app to scan the generated codes")
    print("4. The QR codes will redirect to your chat interface with the product loaded")