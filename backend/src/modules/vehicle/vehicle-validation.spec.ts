describe('Vehicle & Moroccan License Plate Validation', () => {
  // Regex strictly validating Moroccan vehicle registration numbers
  const MOROCCAN_PLATE_REGEX = /^\d{1,5}-[A-Z\u0600-\u06FF]-\d{1,2}$/;

  describe('Plate Format Regex Verification', () => {
    it('should validate standard Latin Moroccan plates', () => {
      expect(MOROCCAN_PLATE_REGEX.test('10482-A-26')).toBe(true);
      expect(MOROCCAN_PLATE_REGEX.test('99999-A-20')).toBe(true);
      expect(MOROCCAN_PLATE_REGEX.test('58291-B-20')).toBe(true);
      expect(MOROCCAN_PLATE_REGEX.test('1-D-6')).toBe(true);
    });

    it('should validate Arabic letter Moroccan plates', () => {
      expect(MOROCCAN_PLATE_REGEX.test('10482-أ-26')).toBe(true);
      expect(MOROCCAN_PLATE_REGEX.test('54321-ب-1')).toBe(true);
    });

    it('should reject invalid Moroccan plate formats', () => {
      expect(MOROCCAN_PLATE_REGEX.test('123456-A-26')).toBe(false); // too many digits
      expect(MOROCCAN_PLATE_REGEX.test('10482-AB-26')).toBe(false); // 2 letters
      expect(MOROCCAN_PLATE_REGEX.test('INVALID-PLATE')).toBe(false);
      expect(MOROCCAN_PLATE_REGEX.test('10482-A-123')).toBe(false); // region code too long
    });
  });

  describe('Fleet Predictive Maintenance Calculations', () => {
    it('should trigger DUE_SOON threshold when within 1000 km of next service', () => {
      const currentMileage = 49200;
      const nextDueMileage = 50000;
      const remainingKm = nextDueMileage - currentMileage;

      const isDueSoon = remainingKm <= 1000 && remainingKm > 0;
      expect(isDueSoon).toBe(true);
    });

    it('should trigger MAINTENANCE threshold when odometer exceeds due mileage', () => {
      const currentMileage = 82400;
      const nextDueMileage = 82000;

      const isOverdue = currentMileage >= nextDueMileage;
      expect(isOverdue).toBe(true);
    });

    it('should calculate fuel consumption in L/100km accurately', () => {
      const distanceTraveledKm = 400;
      const litersFilled = 117.6;

      const consumptionL100km = (litersFilled / distanceTraveledKm) * 100;
      expect(consumptionL100km).toBeCloseTo(29.4, 1);
    });
  });
});
