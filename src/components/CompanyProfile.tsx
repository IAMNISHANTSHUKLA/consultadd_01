
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, BadgeCheck, Plus, Trash } from "lucide-react";

interface CompanyDetails {
  companyName: string;
  certifications: string[];
  experience: Record<string, any>;
  capabilities: string[];
  registrations: string[];
}

interface CompanyProfileProps {
  companyDetails: CompanyDetails;
  onUpdateCompanyDetails: (details: CompanyDetails) => void;
}

export function CompanyProfile({ companyDetails, onUpdateCompanyDetails }: CompanyProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState<CompanyDetails>({ ...companyDetails });
  const [newCertification, setNewCertification] = useState("");
  const [newCapability, setNewCapability] = useState("");
  const [newRegistration, setNewRegistration] = useState("");
  const [newExperienceArea, setNewExperienceArea] = useState("");
  const [newExperienceYears, setNewExperienceYears] = useState("");
  
  const handleSave = () => {
    onUpdateCompanyDetails(editedDetails);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedDetails({ ...companyDetails });
    setIsEditing(false);
  };
  
  const addCertification = () => {
    if (newCertification.trim()) {
      setEditedDetails({
        ...editedDetails,
        certifications: [...editedDetails.certifications, newCertification.trim()]
      });
      setNewCertification("");
    }
  };
  
  const removeCertification = (index: number) => {
    setEditedDetails({
      ...editedDetails,
      certifications: editedDetails.certifications.filter((_, i) => i !== index)
    });
  };
  
  const addCapability = () => {
    if (newCapability.trim()) {
      setEditedDetails({
        ...editedDetails,
        capabilities: [...editedDetails.capabilities, newCapability.trim()]
      });
      setNewCapability("");
    }
  };
  
  const removeCapability = (index: number) => {
    setEditedDetails({
      ...editedDetails,
      capabilities: editedDetails.capabilities.filter((_, i) => i !== index)
    });
  };
  
  const addRegistration = () => {
    if (newRegistration.trim()) {
      setEditedDetails({
        ...editedDetails,
        registrations: [...editedDetails.registrations, newRegistration.trim()]
      });
      setNewRegistration("");
    }
  };
  
  const removeRegistration = (index: number) => {
    setEditedDetails({
      ...editedDetails,
      registrations: editedDetails.registrations.filter((_, i) => i !== index)
    });
  };
  
  const addExperience = () => {
    if (newExperienceArea.trim() && newExperienceYears.trim()) {
      const years = parseInt(newExperienceYears);
      if (!isNaN(years) && years > 0) {
        setEditedDetails({
          ...editedDetails,
          experience: {
            ...editedDetails.experience,
            [newExperienceArea.trim()]: { years }
          }
        });
        setNewExperienceArea("");
        setNewExperienceYears("");
      }
    }
  };
  
  const removeExperience = (area: string) => {
    const { [area]: _, ...restExperience } = editedDetails.experience;
    setEditedDetails({
      ...editedDetails,
      experience: restExperience
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>
                Your company information for RFP eligibility assessment
              </CardDescription>
            </div>
          </div>
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          {isEditing ? (
            <Input
              id="companyName"
              value={editedDetails.companyName}
              onChange={(e) => setEditedDetails({ ...editedDetails, companyName: e.target.value })}
            />
          ) : (
            <p className="text-sm">{companyDetails.companyName}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label>Certifications</Label>
          <div className="flex flex-wrap gap-2">
            {(isEditing ? editedDetails : companyDetails).certifications.map((cert, index) => (
              <div 
                key={index} 
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                  isEditing ? 'bg-muted' : 'bg-primary/10'
                }`}
              >
                <BadgeCheck className="h-3 w-3 text-primary" />
                {cert}
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-full"
                    onClick={() => removeCertification(index)}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          {isEditing && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add certification..."
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
              />
              <Button 
                size="sm" 
                onClick={addCertification}
                disabled={!newCertification.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label>Experience</Label>
          <div className="space-y-2">
            {Object.entries((isEditing ? editedDetails : companyDetails).experience).map(([area, details]) => (
              <div 
                key={area} 
                className={`flex justify-between items-center p-2 rounded ${
                  isEditing ? 'bg-muted' : 'bg-primary/5'
                }`}
              >
                <div>
                  <span className="font-medium">{area}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {(details as any).years} years
                  </span>
                </div>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(area)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          {isEditing && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Area of expertise..."
                value={newExperienceArea}
                onChange={(e) => setNewExperienceArea(e.target.value)}
                className="flex-grow"
              />
              <Input
                placeholder="Years"
                type="number"
                min="1"
                value={newExperienceYears}
                onChange={(e) => setNewExperienceYears(e.target.value)}
                className="w-24"
              />
              <Button 
                size="sm" 
                onClick={addExperience}
                disabled={!newExperienceArea.trim() || !newExperienceYears.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label>Capabilities</Label>
          <div className="flex flex-wrap gap-2">
            {(isEditing ? editedDetails : companyDetails).capabilities.map((capability, index) => (
              <div 
                key={index} 
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                  isEditing ? 'bg-muted' : 'bg-primary/10'
                }`}
              >
                {capability}
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-full"
                    onClick={() => removeCapability(index)}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          {isEditing && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add capability..."
                value={newCapability}
                onChange={(e) => setNewCapability(e.target.value)}
              />
              <Button 
                size="sm" 
                onClick={addCapability}
                disabled={!newCapability.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label>Registrations</Label>
          <div className="flex flex-wrap gap-2">
            {(isEditing ? editedDetails : companyDetails).registrations.map((registration, index) => (
              <div 
                key={index} 
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                  isEditing ? 'bg-muted' : 'bg-primary/10'
                }`}
              >
                {registration}
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-full"
                    onClick={() => removeRegistration(index)}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          {isEditing && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add registration..."
                value={newRegistration}
                onChange={(e) => setNewRegistration(e.target.value)}
              />
              <Button 
                size="sm" 
                onClick={addRegistration}
                disabled={!newRegistration.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
