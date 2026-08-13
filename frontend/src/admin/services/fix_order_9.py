import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="G@urav123",
        database="GroceryMart_db"
    )
    cursor = conn.cursor()
    
    # Update order 9 status to CONFIRMED
    print("Resetting order 9 status to CONFIRMED...")
    cursor.execute("UPDATE orders SET status = 'CONFIRMED', delivery_partner_id = NULL WHERE order_id = 9")
    conn.commit()
    print("Order 9 reset successfully!")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
