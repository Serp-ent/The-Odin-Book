import { useEffect, useState } from "react";
import { useAuth } from "../auth/authContext";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ClipLoader } from "react-spinners";

export default function Register() {
  const navigate = useNavigate();
  const { t, ready } = useTranslation('header');

  const [formData, setFormData] = useState({
    username: '', email: '', password: '',
    firstName: '', lastName: '', confirmPassword: '',
    profilePic: null,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const requiredFields = ['username', 'email', 'password', 'confirmPassword'];

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'username':
        if (!value) error = t('usernameRequired');
        break;
      case 'email':
        if (!value || !value.includes('@')) error = t('invalidEmail');
        break;
      case 'password':
        if (!value) error = t('passwordRequired');
        else if (value.length < 6) error = t('passwordTooShort');
        break;
      case 'confirmPassword':
        if (!value) error = t('confirmPasswordRequired');
        else if (value !== formData.password) error = t('passwordDoNotMatch');
        break;
      default:
        break;
    }

    return error;
  };

  // Validate all required fields
  const validateForm = () => {
    const tempErrors = {};

    requiredFields.forEach(name => {
      const error = validateField(name, formData[name]);
      if (error) tempErrors[name] = error;
    });

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0; // Return true if no errors
  };

  useEffect(() => {
    // Perform live validation on touched fields
    const tempErrors = {};
    Object.keys(formData).forEach(name => {
      if (touched[name]) {
        const error = validateField(name, formData[name]);
        if (error) tempErrors[name] = error;
      }
    });
    setErrors(tempErrors);
  }, [formData, touched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value,
    }));

    // Mark the field as touched
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prevFormData => ({
      ...prevFormData,
      profilePic: file,
    }));

    // Mark the file input as touched
    setTouched(prevTouched => ({
      ...prevTouched,
      profilePic: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields
    const isValid = validateForm();
    if (!isValid) return;

    const formDataToSend = new FormData();
    formDataToSend.append('username', formData.username);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('passwordConfirm', formData.confirmPassword);
    formDataToSend.append('firstName', formData.firstName);
    formDataToSend.append('lastName', formData.lastName);
    formDataToSend.append('profilePic', formData.profilePic); // This is the file

    try {
      const response = await fetch('http://localhost:3000/register', {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();
      console.log("register response:", result);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const getInputBorderClass = (field) => {
    if (errors[field]) return 'border-red-500';
    if (formData[field] || field === 'profilePic') return 'border-green-500';
    return 'border-gray-500';
  };

  const fields = [
    { name: 'firstName', label: t('firstName'), type: 'text' },
    { name: 'lastName', label: t('lastName'), type: 'text' },
    { name: 'username', label: t('username'), type: 'text' },
    { name: 'email', label: t('email'), type: 'email' },
    { name: 'password', label: t("password"), type: 'password' },
    { name: 'confirmPassword', label: t('confirmPassword'), type: 'password' },
  ];

  if (!ready) {
    return <div className="flex justify-center items-center h-full"><ClipLoader /></div>
  }

  return (
    <main className='p-4 flex flex-col items-center container mx-auto sm:w-[500px]'>
      <form
        onSubmit={handleSubmit}
        className='border-2 p-4 flex flex-col gap-2 rounded shadow border-gray-700 w-full'
        method="POST"
        encType="multipart/form-data"
      >
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col">
            <label>
              {field.label} {requiredFields.includes(field.name) && <span className="text-red-500">*</span>}
            </label>
            <input
              className={`border dark:bg-gray-800 p-1 rounded ${getInputBorderClass(field.name)}`}
              name={field.name}
              type={field.type}
              value={formData[field.name]}
              onChange={handleChange}
              onBlur={() => setTouched(prevTouched => ({ ...prevTouched, [field.name]: true }))}
            />
            {errors[field.name] && <p className="text-red-500 text-xs">{errors[field.name]}</p>}
          </div>
        ))}

        <div className="flex flex-col">
          <label>{t('profilePic')}</label>
          <input
            className="text-xs border dark:bg-gray-800 p-1 rounded"
            name="profilePic"
            type="file"
            onChange={handleFileChange}
            onBlur={() => setTouched(prevTouched => ({ ...prevTouched, profilePic: true }))}
          />
        </div>

        <div className="flex justify-end">
          <button
            className={`border border-gray-600 px-2 py-1 rounded text-sm ${Object.keys(errors).length > 0 ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-background-light dark:bg-background-dark cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-800'}`}
            disabled={Object.keys(errors).length > 0}
            type="submit"
          >
            {t('register')}
          </button>
        </div>

      </form>

      <div className="flex justify-center mt-4 text-sm">
        <p>
          {t('alreadyRegisteredQuestion')}{' '}
          <Link
            to='/login'
            className="text-accent-light dark:text-accent-dark underline"
          >
            {t('login')}
          </Link>.
        </p>
      </div>
    </main>
  );
}