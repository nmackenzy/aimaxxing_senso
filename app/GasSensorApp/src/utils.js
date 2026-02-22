export const getStatusColor = (value, threshold) => {
    const ratio = value / threshold;
    if (ratio < 0.5)  return '#2ecc71'; // green - safe
    if (ratio < 0.75) return '#f39c12'; // orange - warning
    if (ratio < 1)    return '#e67e22'; // dark orange - caution
    return '#e74c3c';                   // red - danger
  };