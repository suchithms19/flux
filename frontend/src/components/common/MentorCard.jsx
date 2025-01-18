import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"

export default function ProfileCard({ mentor }) {
  const navigate = useNavigate();
  
  const handleViewProfile = () => {
    navigate(`/mentor/${mentor._id}`);
  };

  return (
    <Card className="p-4 max-w-4xl mx-auto ">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          <img
            src={mentor.profilePhoto}
            alt={`${mentor.fullName}'s profile picture`}
            className="w-32 h-32 rounded-lg object-cover shadow-sm"
          />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-gray-900">{mentor.fullName}</h1>
            <div>
              <p className="text-sm text-gray-700 font-medium">
                {mentor.role} at <span className="font-semibold">{mentor.organization}</span>
              </p>
              <p className="text-sm font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full inline-block mt-1">
                {mentor.headline}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-3 md:line-clamp-2 ">
            {mentor.bio}
          </p>

          {/* Topics */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {mentor.mentoringTopics?.slice(0, 15).map((topic, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-gray-900">₹{mentor.ratePerMinute}</span>
              <span className="text-sm text-gray-600">/min</span>
            </div>
            <Button 
              onClick={handleViewProfile}
              className="bg-customYellow hover:bg-customYellow hover:scale-105 text-black font-medium px-6 py-2 rounded-full transition-all"
            >
              View Profile
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

