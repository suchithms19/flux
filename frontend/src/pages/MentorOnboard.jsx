import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Github, Linkedin, Twitter, Instagram, Upload, Loader2, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const API_URL = import.meta.env.VITE_API_URL;

const MentorOnboard = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [educationFields, setEducationFields] = useState([{ degree: '', institution: '', year: '' }]);
  const [workFields, setWorkFields] = useState([{ company: '', role: '', duration: '' }]);
  const [topicInput, setTopicInput] = useState('');
  const [suggestions, setSuggestions] = useState([
    'React', 'JavaScript', 'Python', 'Java', 'Node.js', 
    'Database', 'System Design', 'Interview Prep', 
    'Data Structures', 'Algorithms', 'Web Development', 
    'Mobile Development', 'Client Acquisition', 
    'Portfolio Building', 'Time Management', 
    'Pricing Strategies', 'Resume Building', 
    'Networking', 'Career Transition'
  ]);
  
  
  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      gender: 'male',
      organization: '',
      role: '',
      experience: '',
      headline: '',
      bio: '',
      languages: '',
      linkedin: '',
      twitter: '',
      github: '',
      instagram: '',
      mentoringAreas: [],
      mentoringTopics: [],
      profilePhoto: '',
    },
    resolver: zodResolver(
      z.object({
        fullName: z.string().min(1, "Full name is required"),
        email: z.string().min(1, "Email is required").email("Invalid email format"),
        phone: z.string().min(1, "Phone is required").regex(/^\d{10}$/, "Phone must be 10 digits"),
        gender: z.string().min(1, "Gender is required"),
        organization: z.string().min(1, "Organization is required"),
        role: z.string().min(1, "Role is required"),
        experience: z.string().min(1, "Experience is required"),
        headline: z.string().min(1, "Headline is required"),
        bio: z.string().min(1, "Bio is required"),
        languages: z.string().min(1, "Languages are required"),
        mentoringAreas: z.array(z.string()).min(1, "Select at least one mentoring area"),
        mentoringTopics: z.array(z.string()).min(1, "Select at least one mentoring topic"),
        profilePhoto: z.string().min(1, "Profile photo is required"),
        linkedin: z.string().optional(),
        twitter: z.string().optional(),
        github: z.string().optional(),
        instagram: z.string().optional(),
      })
    )
  });

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Show loading state if needed
        setIsSubmitting(true);

        // Create FormData
        const formData = new FormData();
        formData.append('photo', file);

        // Upload to server
        const response = await axios.post(
          `${API_URL}/mentors/upload-photo`,
          formData,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.data.url) {
          // Update form state
          form.setValue('profilePhoto', response.data.url);
          // Clear any previous errors
          form.clearErrors('profilePhoto');
          
          // Show preview
          const reader = new FileReader();
          reader.onloadend = () => {
            setProfilePhoto(reader.result);
          };
          reader.readAsDataURL(file);

          toast.success('Photo uploaded successfully');
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload photo');
        form.setError('profilePhoto', {
          type: 'manual',
          message: 'Failed to upload photo. Please try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const addEducationField = () => {
    setEducationFields([...educationFields, { degree: '', institution: '', year: '' }]);
  };

  const removeEducationField = (index) => {
    const newFields = educationFields.filter((_, i) => i !== index);
    setEducationFields(newFields);
  };

  const addWorkField = () => {
    setWorkFields([...workFields, { company: '', role: '', duration: '' }]);
  };

  const removeWorkField = (index) => {
    const newFields = workFields.filter((_, i) => i !== index);
    setWorkFields(newFields);
  };

  const handleTopicInputChange = (e) => {
    setTopicInput(e.target.value);
  };

  const handleAddTopic = (topic) => {
    const currentTopics = form.getValues('mentoringTopics') || [];
    if (!currentTopics.includes(topic)) {
      form.setValue('mentoringTopics', [...currentTopics, topic]);
    }
    setTopicInput(''); // Clear input after adding
  };

  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      
      // Get the file input element
      const fileInput = document.querySelector('input[type="file"]');
      const file = fileInput?.files[0];

      // If there's a file and no profilePhoto URL yet, upload it first
      if (file && !values.profilePhoto) {
        try {
          const formData = new FormData();
          formData.append('photo', file);

          const uploadResponse = await axios.post(
            `${API_URL}/mentors/upload-photo`,
            formData,
            {
              withCredentials: true,
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          if (uploadResponse.data.url) {
            values.profilePhoto = uploadResponse.data.url;
          } else {
            throw new Error('Failed to get upload URL');
          }
        } catch (error) {
          console.error('Photo upload error:', error);
          toast.error('Failed to upload photo');
          form.setError('profilePhoto', {
            type: 'manual',
            message: 'Failed to upload photo. Please try again.'
          });
          return;
        }
      }

      // Check if we have a profile photo URL
      if (!values.profilePhoto) {
        form.setError('profilePhoto', {
          type: 'manual',
          message: 'Profile photo is required'
        });
        return;
      }

      // Submit the form data with the photo URL
      const response = await axios.post(
        `${API_URL}/mentors/onboard`,
        {
          ...values,
          profilePhoto: values.profilePhoto
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        toast.success('Application submitted successfully!');
        navigate('/mentor/thank-you');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
      if (error.response?.data?.message) {
        const fieldError = error.response.data.message.toLowerCase();
        if (fieldError.includes('required')) {
          const field = fieldError.split(' ')[0].toLowerCase();
          form.setError(field, {
            type: 'manual',
            message: error.response.data.message
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-inter">
      <div className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-lg">
        <div className="relative mb-8 rounded-lg bg-[#ffe05c] p-6">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/waves.svg')] bg-cover opacity-10" />
          </div>
          <h1 className="relative text-2xl font-bold text-black md:text-3xl">
            Mentor the Next Generation with Flux!
          </h1>
          <p className="relative mt-2 text-black">
            Enter your details
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {form.formState.errors.root && (
              <div className="rounded-md bg-red-50 p-4 text-red-600">
                {form.formState.errors.root.message}
              </div>
            )}

            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div 
                  className={`h-32 w-32 rounded-full border-2 border-dashed 
                    ${form.formState.errors.profilePhoto ? 'border-red-500' : 'border-gray-300'}
                    flex items-center justify-center overflow-hidden
                    ${isSubmitting ? 'opacity-50' : ''}`}
                >
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <Upload className={`h-8 w-8 ${
                      form.formState.errors.profilePhoto ? 'text-red-500' : 'text-gray-400'
                    }`} />
                  )}
                  {isSubmitting && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={isSubmitting}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Upload your profile photo <span className="text-red-500">*</span>
                </p>
                {form.formState.errors.profilePhoto && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.profilePhoto.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Arjun Mehra" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="arjun@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="9019526435" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-wrap gap-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="male" />
                        </FormControl>
                        <FormLabel className="font-normal">Male</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="female" />
                        </FormControl>
                        <FormLabel className="font-normal">Female</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="others" />
                        </FormControl>
                        <FormLabel className="font-normal">Others</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Organization</FormLabel>
                  <FormControl>
                    <Input placeholder="Company or Institution name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Senior Developer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Experience</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headline</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Goldman Sachs| IIMA Rank 8 | Entrepreneur"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio / About You</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[150px]"
                      placeholder="Tell us about yourself and how you can help mentees. Where can you mentor them?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="languages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Languages you're fluent in</FormLabel>
                  <FormControl>
                    <Input placeholder="English, Kannada, Hindi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mentoringAreas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mentoring Areas <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <div className={`grid grid-cols-2 gap-4 ${
                      form.formState.errors.mentoringAreas ? 'border-red-500' : ''
                    }`}>
                      {[
                        { id: 'coding-software', label: 'Coding & Software' },
                        { id: 'freelancing', label: 'Freelancing' },
                        { id: 'career-job', label: 'Career & Job' },
                      ].map((option) => (
                        <div
                          key={option.id}
                          className={`
                            cursor-pointer rounded-lg border-2 p-4
                            min-h-[80px] flex items-center justify-center
                            transition-all duration-200 hover:shadow-md
                            ${field.value.includes(option.id) 
                              ? 'border-[#ffe05c] bg-[#ffe05c]/10' 
                              : 'border-gray-200 hover:border-gray-300'
                            }
                            ${form.formState.errors.mentoringAreas ? 'border-red-500' : ''}
                          `}
                          onClick={() => {
                            const newValue = field.value.includes(option.id)
                              ? field.value.filter(v => v !== option.id)
                              : [...field.value, option.id];
                            field.onChange(newValue);
                          }}
                        >
                          <span className="text-center">{option.label}</span>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mentoringTopics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mentoring Topics <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <div>
                      <div className="relative">
                        <input
                          type="text"
                          value={topicInput}
                          onChange={handleTopicInputChange}
                          placeholder="Type to search or add topics (React, Client Acquisition , Resume Building) "
                          className="w-full border rounded p-2"
                        />
                        {topicInput && (
                          <div className="absolute z-10 w-full bg-white border rounded shadow-lg mt-1">
                            {suggestions
                              .filter((suggestion) =>
                                suggestion.toLowerCase().includes(topicInput.toLowerCase())
                              )
                              .map((suggestion) => (
                                <div
                                  key={suggestion}
                                  className="p-2 cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleAddTopic(suggestion)}
                                >
                                  {suggestion}
                                </div>
                              ))}
                            <div
                              className="p-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleAddTopic(topicInput)}
                            >
                              Add "{topicInput}"
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {field.value?.map((topic, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#ffe05c] text-black rounded-full"
                          >
                            {topic}
                            <button
                              type="button"
                              onClick={() => {
                                const newTopics = field.value.filter((t) => t !== topic);
                                field.onChange(newTopics);
                              }}
                              className="text-black hover:text-red-500"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Education Details</h3>
                <Button
                  type="button"
                  onClick={addEducationField}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  <Plus className="h-4 w-4" /> Add Education
                </Button>
              </div>
              {educationFields.map((field, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4 relative">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeEducationField(index)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`education.${index}.degree`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Degree</FormLabel>
                          <FormControl>
                            <Input placeholder="B.Tech" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.institution`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institution</FormLabel>
                          <FormControl>
                            <Input placeholder="IIT Delhi" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.year`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input placeholder="2016 - 2020" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Work Experience</h3>
                <Button
                  type="button"
                  onClick={addWorkField}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  <Plus className="h-4 w-4" /> Add Experience
                </Button>
              </div>
              {workFields.map((field, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4 relative">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeWorkField(index)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`work.${index}.company`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Google" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`work.${index}.role`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <Input placeholder="Senior Software Engineer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`work.${index}.duration`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration</FormLabel>
                          <FormControl>
                            <Input placeholder="2020 - Present" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Social Media Links</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-5 w-5 text-[#0077B5]" />
                        <FormControl className="flex-1">
                          <Input 
                            placeholder="LinkedIn profile URL" 
                            {...field}
                            className="transition-all hover:border-[#0077B5] focus:border-[#0077B5]"
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="twitter"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                        <FormControl className="flex-1">
                          <Input 
                            placeholder="Twitter profile URL" 
                            {...field}
                            className="transition-all hover:border-[#1DA1F2] focus:border-[#1DA1F2]"
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <Instagram className="h-5 w-5 text-[#E4405F]" />
                        <FormControl className="flex-1">
                          <Input 
                            placeholder="Instagram profile URL" 
                            {...field}
                            className="transition-all hover:border-[#E4405F] focus:border-[#E4405F]"
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#ffe05c] text-black hover:text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default MentorOnboard



