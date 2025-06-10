// ==================== Signup ====================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("Signup request received:", { name, email, role });

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        msg: "Missing required fields",
        details: {
          name: !name,
          email: !email,
          password: !password,
          role: !role
        }
      });
    }

    const userExists = await User.findOne({ email: email.trim().toLowerCase() });
    if (userExists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const allowedRoles = ["admin", "cashier", "viewer"];
    if (!role || !allowedRoles.includes(role.toLowerCase())) {
      return res.status(400).json({
        msg: "Invalid role",
        details: "Role must be one of: admin, cashier, viewer",
      });
    }

    // Email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role.trim().toLowerCase(),
      isVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationTokenExpires,
    });

    await user.save();
    console.log("User saved successfully:", user.email);

    try {
      const verifyURL = `${process.env.FRONTEND_URL}/login?token=${verificationToken}`;
      await sendEmail({
        to: user.email,
        subject: "Verify your RetailEdge email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to RetailEdge!</h2>
            <p>Hello ${user.name},</p>
            <p>Thank you for signing up. Please click the button below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyURL}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="color: #666; word-break: break-all;">${verifyURL}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>
        `,
      });

      res.status(201).json({
        msg: "User registered successfully. Please check your email to verify.",
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Delete the user if email sending fails
      await User.findByIdAndDelete(user._id);
      throw new Error("Failed to send verification email. Please try again.");
    }
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      msg: error.message || "Server error",
      error: error.message,
      details: error.errors,
    });
  }
});

// ... rest of the routes ... 