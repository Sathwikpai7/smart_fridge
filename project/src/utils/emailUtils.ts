export const sendExpiryNotification = async (email: string, items: any[]) => {
  try {
    // This would typically connect to your backend API that handles SMTP
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: 'Food Expiry Alert',
        items: items,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send notification');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Email notification error:', error);
    // For demo purposes, just log the notification
    console.log('Email notification would be sent to:', email, 'for items:', items);
  }
};