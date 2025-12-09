export interface MethaneAlertConfig {
  threshold: number;
  emailSubject: string;
  emailTemplate: (level: number, timestamp: string) => string;
  visualAlert: boolean;
  soundAlert: boolean;
}

export const DEFAULT_METHANE_CONFIG: MethaneAlertConfig = {
  threshold: 4000,
  emailSubject: '🚨 ETHANE ALERT: High Methane Levels Detected',
  emailTemplate: (level: number, timestamp: string) => `ETHANE ALERT - High Methane Levels Detected!

Your Smart Fridge has detected dangerously high methane levels.

📊 Current Reading: ${level.toFixed(1)} ppm
⚠️  Threshold: 4000 ppm
🕐 Time Detected: ${timestamp}

🚨 IMMEDIATE ACTION REQUIRED:
• Check for spoiled or rotting food items
• Remove any expired products
• Clean the refrigerator thoroughly
• Ensure proper ventilation

This high methane level indicates that food items may be decomposing, which can:
• Create health hazards
• Contaminate other food items
• Cause unpleasant odors
• Lead to foodborne illnesses

Please take immediate action to inspect and clean your refrigerator.

Best regards,
Your Smart Fridge System`,
  visualAlert: true,
  soundAlert: true
};

export const sendMethaneAlert = async (
  methaneLevel: number,
  userEmail: string,
  config: MethaneAlertConfig = DEFAULT_METHANE_CONFIG
): Promise<boolean> => {
  try {
    const currentTime = new Date().toLocaleString();
    const emailData = {
      to: userEmail,
      subject: config.emailSubject,
      text: config.emailTemplate(methaneLevel, currentTime)
    };

    const response = await fetch('http://localhost:4000/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      console.log('Methane alert email sent successfully to:', userEmail);
      return true;
    } else {
      console.error('Failed to send methane alert email');
      return false;
    }
  } catch (error) {
    console.error('Error sending methane alert email:', error);
    return false;
  }
};

export const getUserEmail = async (): Promise<string> => {
  try {
    const settingsResponse = await fetch('http://localhost:4000/api/settings');
    if (settingsResponse.ok) {
      const settings = await settingsResponse.json();
      return settings.email || '';
    }
    return '';
  } catch (error) {
    console.error('Error reading user email from settings:', error);
    return '';
  }
};

export const getMethaneAlertLevel = (methaneLevel: number): 'normal' | 'warning' | 'danger' => {
  if (methaneLevel > 4000) return 'danger';
  if (methaneLevel > 2000) return 'warning';
  return 'normal';
};

export const getMethaneAlertStyles = (level: 'normal' | 'warning' | 'danger') => {
  switch (level) {
    case 'danger':
      return {
        container: 'bg-red-50 border-2 border-red-300 animate-pulse',
        icon: 'text-red-600',
        text: 'text-red-600',
        alertText: '🚨 ALERT!'
      };
    case 'warning':
      return {
        container: 'bg-yellow-50',
        icon: 'text-yellow-600',
        text: 'text-yellow-600',
        alertText: ''
      };
    default:
      return {
        container: 'bg-green-50',
        icon: 'text-green-600',
        text: 'text-green-600',
        alertText: ''
      };
  }
};

export const playAlertSound = (): void => {
  try {
    // Create a simple alert sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.error('Error playing alert sound:', error);
  }
}; 