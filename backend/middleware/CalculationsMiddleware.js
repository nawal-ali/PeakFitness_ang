module.exports = {
    calculateBMI: (weight, height) => (weight / ((height / 100) ** 2)).toFixed(2),
    
    calculateCalories: (weight, height, age, gender) => {
      if (!age || !gender) return null;
      return gender === "male" 
        ? Math.round(88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age))
        : Math.round(447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age));
    },
  
    calculateIdealWeight: (height) => Math.round(22 * ((height / 100) ** 2)),
  
    calculateBodyFat: (weight, height, age, gender) => {
      const bmi = (weight / ((height / 100) ** 2));
      return gender === 'male' 
        ? (1.2 * bmi) + (0.23 * age) - 16.2
        : (1.2 * bmi) + (0.23 * age) - 5.4;
    }
  };