import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Github, Linkedin, Twitter, Instagram, Upload, Loader2 } from 'lucide-react'
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


const MentorOnboard = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    },
  });

  const onSubmit = async (values) => {
    try {
      const requiredFields = [
        'fullName',
        'email',
        'phone',
        'gender',
        'organization',
        'role',
        'experience',
        'headline',
        'bio',
        'languages',
        'mentoringAreas'
      ];

      let hasError = false;
      requiredFields.forEach(field => {
        if (!values[field] || (Array.isArray(values[field]) && values[field].length === 0)) {
          form.setError(field, {
            type: 'required',
            message: 'This field is required'
          });
          hasError = true;
        }
      });

      if (values.email && !/\S+@\S+\.\S+/.test(values.email)) {
        form.setError('email', {
          type: 'pattern',
          message: 'Please enter a valid email address'
        });
        hasError = true;
      }

      if (values.phone && !/^\d{10}$/.test(values.phone)) {
        form.setError('phone', {
          type: 'pattern',
          message: 'Please enter a valid 10-digit phone number'
        });
        hasError = true;
      }

      if (hasError) {
        return;
      }

      setIsSubmitting(true);
      const response = await fetch(
        `/api/submitMentorForm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Form submission failed');
      }
      
      navigate('/thank-you');
      
    } catch (error) {
      console.error('Error:', error);
      form.setError('root', {
        type: 'submitError',
        message: error.message || 'Failed to submit form. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

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

            <div>
              <FormField
                control={form.control}
                name="fullName"
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name </FormLabel>
                    <FormControl>
                      <Input placeholder="Arjun Mehra" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                rules={{ 
                  required: "Email is required",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Please enter a valid email address"
                  }
                }}
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
              rules={{ required: "Please select at least one mentoring area" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mentoring Areas</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
                      {[
                        { id: 'coding-software', label: 'Coding & Software' },
                        { id: 'mba-cat', label: 'MBA/CAT' },
                        { id: 'freelancing', label: 'Freelancing' },
                        { id: 'career-job', label: 'Career & Job' },
                      ].map((option) => (
                        <div
                          key={option.id}
                          className={`
                            cursor-pointer rounded-lg border-2 p-4 text-center
                            ${field.value.includes(option.id) 
                              ? 'border-[#ffe05c] bg-[#ffe05c]/10' 
                              : 'border-gray-200'
                            }
                          `}
                          onClick={() => {
                            const newValue = field.value.includes(option.id)
                              ? field.value.filter(v => v !== option.id)
                              : [...field.value, option.id];
                            field.onChange(newValue);
                          }}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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



