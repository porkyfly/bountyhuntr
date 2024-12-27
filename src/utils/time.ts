export function getRemainingTime(expiryMinutes: number | null, createdAt: Date): string {
  if (!expiryMinutes) return '';
  
  const expiryTime = new Date(createdAt).getTime() + expiryMinutes * 60 * 1000;
  const remainingMs = expiryTime - Date.now();
  
  if (remainingMs <= 0) return 'Expired';
  
  const remainingMins = Math.floor(remainingMs / (60 * 1000));
  if (remainingMins < 60) return `${remainingMins}m left`;
  
  const remainingHours = Math.floor(remainingMins / 60);
  if (remainingHours < 24) return `${remainingHours}h ${remainingMins % 60}m left`;
  
  const remainingDays = Math.floor(remainingHours / 24);
  return `${remainingDays}d ${remainingHours % 24}h left`;
} 