import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils,
  AlertTriangle,
  CheckCircle,
  User,
  School,
  Phone,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Lock,
  Send,
} from "lucide-react";
import { auth, db } from "../config"; // Adjust path as needed
import { doc, setDoc } from "firebase/firestore";
import Aurora from "./Aurora"; // Import the Aurora component

const UserDetails = () => {
  // Form steps - 0: Basic Info, 1: Academic Info, 2: Contact Info, 3: OTP Verification
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    course: "",
    section: "",
    semester: "",
    rollNumber: "",
    contactNumber: "",
    otp: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Comprehensive list of departments and courses
  const departmentsWithCourses = {
    "Department of Computer Science and Engineering": [
      "Bachelor of Technology (B.Tech) in Computer Science and Engineering",
      "Master of Technology (M.Tech) in Computer Science and Engineering",
      "Master of Technology (M.Tech) in Computer Science and Engineering"
    ],
    "Department of Electrical and Electronics Engineering": [
      "Bachelor of Technology (B.Tech) in Electrical and Electronics Engineering",
      "Master of Technology (M.Tech) in Electrical and Electronics Engineering",
      "Master of Technology (M.Tech) in Electrical and Electronics Engineering"
    ],
    "Department of Civil Engineering": [
      "Bachelor of Technology (B.Tech) in Civil Engineering",
      "Master of Technology (M.Tech) in Structural Engineering",
      "Master of Technology (M.Tech) in Structural Engineering"
    ],
    "Department of Mechanical Engineering": [
      "Bachelor of Technology (B.Tech) in Mechanical Engineering",
      "Master of Technology (M.Tech) in Mechanical Engineering",
      "Master of Technology (M.Tech) in Mechanical Engineering"
    ],
    "Department of Physics": [
      "Bachelor of Science (B.Sc) in Physics",
      "Master of Science (M.Sc) in Physics",
      "Master of Science (M.Sc) in Physics"
    ],
    "Department of Chemistry": [
      "Bachelor of Science (B.Sc) in Chemistry",
      "Master of Science (M.Sc) in Chemistry"
    ],
    "Department of Mathematics": [
      "Bachelor of Science (B.Sc) in Mathematics",
      "Master of Science (M.Sc) in Mathematics"
    ],
    "Department of Forensic Science": [
      "Bachelor of Science (B.Sc) in Forensic Science",
      "Master of Science (M.Sc) in Forensic Science"
    ],
    "Department of Biological Sciences": [
      "Bachelor of Science (B.Sc) in Biological Sciences",
      "Master of Science (M.Sc) in Biological Sciences"
    ],
    "Department of Biotechnology": [
      "Bachelor of Science (B.Sc) in Biotechnology",
      "Master of Science (M.Sc) in Biotechnology"
    ],
    "Department of English Language and Literature": [
      "Bachelor of Arts (B.A) in English Language and Literature",
      "Master of Arts (M.A) in English Language and Literature"
    ],
    "Department of Bengali Language and Literature": [
      "Bachelor of Arts (B.A) in Bengali Language and Literature",
      "Master of Arts (M.A) in Bengali Language and Literature"
    ],
    "Department of History": [
      "Bachelor of Arts (B.A) in History",
      "Master of Arts (M.A) in History"
    ],
    "Department of Political Science": [
      "Bachelor of Arts (B.A) in Political Science",
      "Master of Arts (M.A) in Political Science"
    ],
    "Department of Sociology": [
      "Bachelor of Arts (B.A) in Sociology",
      "Master of Arts (M.A) in Sociology"
    ],
    "Department of Geography": [
      "Bachelor of Arts (B.A) in Geography",
      "Master of Arts (M.A) in Geography"
    ],
    "Department of Management": [
      "Bachelor of Business Administration (BBA)",
      "Master of Business Administration (MBA)"
    ],
    "Department of Commerce and Economics": [
      "Bachelor of Commerce (B.Com)",
      "Master of Commerce (M.Com)"
    ],
    "Department of Law": [
      "Bachelor of Arts and Bachelor of Laws (BA LL.B. Hons.)",
      "Bachelor of Business Administration and Bachelor of Laws (BBA LL.B. Hons.)",
      "Master of Laws (LL.M.)",
      "Doctor of Philosophy (Ph.D.) in Law"
    ],
    "Department of Education": [
      "Bachelor of Education (B.Ed)",
      "Master of Education (M.Ed)",
      "Doctor of Philosophy (Ph.D.) in Education"
    ],
    "Department of Journalism and Mass Communication": [
      "Bachelor of Arts (B.A) in Journalism and Mass Communication",
      "Master of Arts (M.A) in Journalism and Mass Communication"
    ],
    "Department of Films and Animation": [
      "Bachelor of Fine Arts (BFA) in Films and Animation",
      "Master of Fine Arts (MFA) in Films and Animation"
    ],
    "Department of Allied Health Sciences": [
      "Bachelor of Science (B.Sc) in Allied Health Sciences",
      "Master of Science (M.Sc) in Allied Health Sciences"
    ],
    "Department of Pharmaceutical Technology": [
      "Bachelor of Pharmacy (B.Pharm)",
      "Diploma in Pharmacy (D.Pharm)"
    ],
    "Department of Smart Agriculture": [
      "Bachelor of Science (B.Sc) in Smart Agriculture",
      "Master of Science (M.Sc) in Smart Agriculture"
    ]
    // Additional departments removed for brevity
  };


  // Get all department names for the dropdown
  const departments = Object.keys(departmentsWithCourses);
  const sections = ["A", "B", "C", "D", "E","F","G","H","I","J"];
  const semesters = [
    "1st Semester",
    "2nd Semester",
    "3rd Semester",
    "4th Semester",
    "5th Semester",
    "6th Semester",
    "7th Semester",
    "8th Semester",
  ];

  // Update courses when department changes
  useEffect(() => {
    if (formData.department) {
      setAvailableCourses(departmentsWithCourses[formData.department] || []);
      // Reset course selection when department changes
      setFormData((prevState) => ({ ...prevState, course: "" }));
    } else {
      setAvailableCourses([]);
    }
  }, [formData.department]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 0) {
      // Validate Name
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      }
    } else if (currentStep === 1) {
      // Validate Department
      if (!formData.department) {
        newErrors.department = "Please select your department";
      }
      // Validate Course
      if (!formData.course) {
        newErrors.course = "Please select your course";
      }
      // Validate Section
      if (!formData.section) {
        newErrors.section = "Please select your section";
      }
      // Validate Semester
      if (!formData.semester) {
        newErrors.semester = "Please select your semester";
      }
    } else if (currentStep === 2) {
      // Validate Roll Number - added check for length > 5
      if (!formData.rollNumber.trim()) {
        newErrors.rollNumber = "Roll number is required";
      } else if (formData.rollNumber.trim().length < 6) {
        newErrors.rollNumber = "Please enter your full roll number (min 6 characters)";
      }

      // Validate Contact Number
      if (!formData.contactNumber.trim()) {
        newErrors.contactNumber = "Contact number is required";
      } else if (!/^\d{10}$/.test(formData.contactNumber)) {
        newErrors.contactNumber =
          "Please enter a valid 10-digit contact number";
      }
    } else if (currentStep === 3) {
      // Validate OTP
      if (!formData.otp.trim()) {
        newErrors.otp = "OTP is required";
      } else if (formData.otp !== generatedOtp) {
        newErrors.otp = "Invalid OTP. Please try again.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAllSteps = () => {
    const allErrors = {};

    // Validate all fields
    if (!formData.name.trim()) {
      allErrors.name = "Name is required";
    }
    if (!formData.department) {
      allErrors.department = "Please select your department";
    }
    if (!formData.course) {
      allErrors.course = "Please select your course";
    }
    if (!formData.section) {
      allErrors.section = "Please select your section";
    }
    if (!formData.semester) {
      allErrors.semester = "Please select your semester";
    }
    if (!formData.rollNumber.trim()) {
      allErrors.rollNumber = "Roll number is required";
    } else if (formData.rollNumber.trim().length < 6) {
      allErrors.rollNumber = "Please enter your full roll number (min 6 characters)";
    }
    if (!formData.contactNumber.trim()) {
      allErrors.contactNumber = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contactNumber)) {
      allErrors.contactNumber = "Please enter a valid 10-digit contact number";
    }
    if (!otpVerified) {
      allErrors.otp = "Please verify your contact number with OTP";
    }

    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleNextStep = () => {
    if (validateStep()) {
      // If we're moving to the OTP step and OTP hasn't been verified yet
      if (currentStep === 2 && !otpVerified) {
        setCurrentStep(3);
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Generate and send OTP
  const handleSendOTP = () => {
    if (!/^\d{10}$/.test(formData.contactNumber)) {
      setErrors({
        ...errors,
        contactNumber: "Please enter a valid 10-digit contact number",
      });
      return;
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);
    setCountdown(60); // Set countdown for 60 seconds

    // In a real application, you would send this OTP via SMS
    console.log(`OTP sent to ${formData.contactNumber}: ${otp}`);

    // For development, alert the OTP (remove in production)
    alert(`Your OTP is: ${otp} (This alert is only for development)`);
  };

  // Verify OTP
  const handleVerifyOTP = () => {
    if (formData.otp === generatedOtp) {
      setOtpVerified(true);
      setErrors({...errors, otp: ""});
    } else {
      setErrors({...errors, otp: "Invalid OTP. Please try again."});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!otpVerified) {
      setSubmitError("Please verify your contact number with OTP");
      return;
    }

    if (validateAllSteps()) {
      setIsLoading(true);
      try {
        const user = auth.currentUser;

        if (!user) {
          throw new Error("User not authenticated");
        }

        // Save user details to Firestore
        await setDoc(doc(db, "userProfiles", user.uid), {
          uid: user.uid,
          email: user.email,
          name: formData.name,
          department: formData.department,
          course: formData.course,
          section: formData.section,
          semester: formData.semester,
          rollNumber: formData.rollNumber,
          contactNumber: formData.contactNumber,
          contactVerified: true,
          createdAt: new Date(),
        });

        // Set submission successful
        setIsSubmitted(true);
        console.log("User details saved:", formData);
      } catch (error) {
        console.error("Error saving user details:", error);
        setSubmitError("Failed to save your details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Aurora component props with orange color scheme
  const auroraProps = {
    colorStops: ["#FF8C00", "#FF4500", "#FF8C00"], // Orange color scheme
    amplitude: 0.8,
    blend: 0.6,
  };

  // Step indicator/progress bar
  const ProgressBar = () => {
    const steps = ["Basic Info", "Academic Details", "Contact Info", "Verify OTP"];

    return (
      <div className="flex justify-between mb-6 px-2">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center
                ${
                  currentStep >= index
                    ? "bg-orange-500 text-white"
                    : "bg-gray-700 text-gray-400"
                }`}
            >
              {index + 1}
            </div>
            <span
              className={`text-xs mt-1 ${
                currentStep >= index ? "text-orange-500" : "text-gray-500"
              }`}
            >
              {step}
            </span>
          </div>
        ))}
        <div className="absolute left-0 right-0 top-20 flex justify-center">
          <div className="h-1 bg-gray-700 w-4/5 relative">
            <div
              className="h-full bg-orange-500 absolute top-0 left-0 transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  // Form steps content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="space-y-6"
          >
            <div className="mb-4">
              <label className="block text-gray-300 text-lg mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className={`w-full p-3 pl-10 rounded-lg border bg-gray-900 text-white ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-700 focus:ring-orange-500"
                  } focus:outline-none focus:ring-2`}
                />
              </div>
              {errors.name && (
                <div className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertTriangle size={16} className="mr-2" />
                  {errors.name}
                </div>
              )}
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="space-y-4"
          >
            {/* Department Dropdown */}
            <div className="mb-4">
              <label className="block text-gray-300 text-lg mb-2">
                Department
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <School size={18} className="text-gray-400" />
                </div>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full p-3 pl-10 rounded-lg border appearance-none bg-gray-900 text-white ${
                    errors.department
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-700 focus:ring-orange-500"
                  } focus:outline-none focus:ring-2`}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              {errors.department && (
                <div className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertTriangle size={16} className="mr-2" />
                  {errors.department}
                </div>
              )}
            </div>

            {/* Course Dropdown */}
            <div className="mb-4">
              <label className="block text-gray-300 text-lg mb-2">Course</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BookOpen size={18} className="text-gray-400" />
                </div>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  disabled={!formData.department}
                  className={`w-full p-3 pl-10 rounded-lg border appearance-none bg-gray-900 text-white ${
                    errors.course
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-700 focus:ring-orange-500"
                  } focus:outline-none focus:ring-2 ${
                    !formData.department ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">Select Course</option>
                  {availableCourses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              {errors.course && (
                <div className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertTriangle size={16} className="mr-2" />
                  {errors.course}
                </div>
              )}
            </div>

            {/* Section and Semester in a row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Section Dropdown */}
              <div>
                <label className="block text-gray-300 text-lg mb-2">
                  Section
                </label>
                <div className="relative">
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-lg border appearance-none bg-gray-900 text-white ${
                      errors.section
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-700 focus:ring-orange-500"
                    } focus:outline-none focus:ring-2`}
                  >
                    <option value="">Select</option>
                    {sections.map((section) => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {errors.section && (
                  <div className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle size={16} className="mr-2" />
                    {errors.section}
                  </div>
                )}
              </div>

              {/* Semester Dropdown */}
              <div>
                <label className="block text-gray-300 text-lg mb-2">
                  Semester
                </label>
                <div className="relative">
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-lg border appearance-none bg-gray-900 text-white ${
                      errors.semester
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-700 focus:ring-orange-500"
                    } focus:outline-none focus:ring-2`}
                  >
                    <option value="">Select</option>
                    {semesters.map((semester) => (
                      <option key={semester} value={semester}>
                        {semester}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {errors.semester && (
                  <div className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle size={16} className="mr-2" />
                    {errors.semester}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="space-y-6"
          >
            {/* Roll Number Input */}
            <div className="mb-4">
              <label className="block text-gray-300 text-lg mb-2">
                Roll Number
              </label>
              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="Enter your Full Roll Number"
                className={`w-full p-3 rounded-lg border bg-gray-900 text-white ${
                  errors.rollNumber
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-700 focus:ring-orange-500"
                } focus:outline-none focus:ring-2`}
              />
              {errors.rollNumber && (
                <div className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertTriangle size={16} className="mr-2" />
                  {errors.rollNumber}
                </div>
              )}
            </div>

            {/* Contact Number Input */}
            <div className="mb-4">
              <label className="block text-gray-300 text-lg mb-2">
                Contact Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  maxLength={10}
                  className={`w-full p-3 pl-10 rounded-lg border bg-gray-900 text-white ${
                    errors.contactNumber
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-700 focus:ring-orange-500"
                  } focus:outline-none focus:ring-2`}
                />
              </div>
              {errors.contactNumber && (
                <div className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertTriangle size={16} className="mr-2" />
                  {errors.contactNumber}
                </div>
              )}
            </div>

            {otpVerified && (
              <div className="flex items-center text-green-500 mt-2">
                <CheckCircle size={18} className="mr-2" />
                <span>Contact number verified successfully</span>
              </div>
            )}
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="space-y-6"
          >
            {/* OTP Verification */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="text-lg font-medium text-orange-500 mb-2">
                Verify Your Contact Number
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                We'll send a verification code to {formData.contactNumber}
              </p>

              {!otpSent ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendOTP}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center justify-center w-full"
                >
                  <Send size={18} className="mr-2" />
                  Send OTP
                </motion.button>
              ) : otpVerified ? (
                <div className="flex items-center text-green-500 mt-2">
                  <CheckCircle size={18} className="mr-2" />
                  <span>Contact number verified successfully</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm mb-2">
                      Enter OTP
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="otp"
                        value={formData.otp}
                        onChange={handleChange}
                        placeholder="6-digit OTP"
                        maxLength={6}
                        className={`w-full p-3 pl-10 rounded-lg border bg-gray-900 text-white ${
                          errors.otp
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-700 focus:ring-orange-500"
                        } focus:outline-none focus:ring-2`}
                      />
                    </div>
                    {errors.otp && (
                      <div className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertTriangle size={16} className="mr-2" />
                        {errors.otp}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleVerifyOTP}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center justify-center"
                    >
                      <CheckCircle size={18} className="mr-2" />
                      Verify OTP
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendOTP}
                      disabled={countdown > 0}
                      className={`px-4 py-2 bg-gray-700 text-white rounded-lg flex items-center justify-center ${
                        countdown > 0 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const stepTitles = [
    "Basic Information",
    "Academic Details",
    "Contact Details",
    "OTP Verification",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative p-6">
      {/* Aurora background */}
      <div className="absolute inset-0 z-0 opacity-70">
        <Aurora {...auroraProps} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="bg-black rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10 border border-orange-500"
      >
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8"
          >
            <CheckCircle className="mx-auto text-orange-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-orange-500 mb-4">
              Your profile is complete!
            </h2>
            <p className="text-gray-300">
              Thanks for providing your details. You're all set to use
              MunchMate!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = "/signin")}
              className="mt-6 px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition duration-300"
            >
              Sign In Now
            </motion.button>
          </motion.div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-6 text-center relative">
              <User className="mx-auto text-black" size={36} />
              <h2 className="text-2xl font-bold text-white mt-1">
                Complete Your Profile
              </h2>
              <p className="text-white text-opacity-90 mt-1">
                Step {currentStep + 1}: {stepTitles[currentStep]}
              </p>
            </div>

            <div className="p-6 pt-6 relative">
              <ProgressBar />

              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start"
                >
                  <AlertTriangle
                    size={20}
                    className="mr-2 flex-shrink-0 mt-0.5"
                  />
                  <span>{submitError}</span>
                </motion.div>
              )}

              <form onSubmit={(e) => e.preventDefault()} className="mt-6">
                <AnimatePresence mode="wait">
                  {renderStepContent()}
                </AnimatePresence>

                <div className="flex justify-between mt-8">
                  {currentStep > 0 ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePrevStep}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg flex items-center"
                    >
                      <ChevronLeft size={18} className="mr-1" />
                      Back
                    </motion.button>
                  ) : (
                    <div></div>
                  )}

                  {currentStep < 3 ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNextStep}
                      className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg flex items-center"
                    >
                      Next
                      <ChevronRight size={18} className="ml-1" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={!isLoading ? { scale: 1.05 } : {}}
                      whileTap={!isLoading ? { scale: 0.95 } : {}}
                      onClick={handleSubmit}
                      disabled={isLoading || !otpVerified}
                      className={`px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition duration-300 flex items-center ${
                        isLoading || !otpVerified ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Saving...
                        </>
                      ) : !otpVerified ? (
                        "Verify OTP to Continue"
                      ) : (
                        "Complete Profile"
                      )}
                    </motion.button>
                  )}
                </div>
              </form>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default UserDetails;