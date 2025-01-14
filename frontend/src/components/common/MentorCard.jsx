import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"


export default function ProfileCard() {
  return (
    <Card className="p-6 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          <img
            src="https://res.cloudinary.com/dierfpyk9/image/upload/v1736787484/mentors/t28qqodyutx6vjqfucvq.jpg"
            alt="Profile picture"
            width={200}
            height={200}
            className="rounded-lg object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-black">Gautam Oswal</h1>
            <div className="space-y-1">
              <p className="text-md text-=black font-semibold">
                Senior Business Manager at{" "}
                <span className="text-black font-semibold">Uber</span>
              </p>
              <p className="font-semibold text-sm bg-[#ffd72c]/20 px-2 inline-block mt-2 sm:mt-0 sm:inline">
                Driving growth at Uber, seasoned career mentor
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed text-sm">
            Seasoned Strategy and Growth professional spearheading a $200 M+
            category at Uber. I have 2.5+ years of mentorship experience and have
            helped my mente...
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="secondary" className="rounded-full px-4 py-1 ">
              Interview
            </Badge>
            <Badge variant="secondary" className="rounded-full px-4 py-1">
              Business Strategy
            </Badge>
            <Badge variant="secondary" className="rounded-full px-4 py-1">
              Resume
            </Badge>
            <Badge variant="secondary" className="rounded-full px-4 py-1">
              Growth Strategy
            </Badge>
            <Badge variant="secondary" className="rounded-full px-4 py-1">
              Career Growth
            </Badge>
            <Badge variant="secondary" className="rounded-full px-4 py-1">
              Communication
            </Badge>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-baseline gap-1">
              <span className="text-md font-bold">Rs. 10</span>
              <span className="text-md">/ minute</span>
            </div>
            <Button className="bg-customYellow text-md  hover:bg-customYellow  hover:scale-105 text-black px-8">
              View Profile
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

