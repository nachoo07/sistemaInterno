import { body, validationResult } from "express-validator";

export const validateUser = [
  body("name").notEmpty().withMessage("Name is required."),
  body("mail")
    .isEmail()
    .withMessage("Valid email is required.")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Invalid role."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];