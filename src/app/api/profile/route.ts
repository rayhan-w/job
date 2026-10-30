import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        candidateProfile: {
          include: { district: true },
        },
        educations: { orderBy: { passingYear: "desc" } },
        experiences: { orderBy: { createdAt: "desc" } },
        skills: true,
        cvFile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile: user });
  } catch (error: any) {
    console.error("Fetch profile error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      fatherName,
      motherName,
      dob,
      gender,
      nid,
      presentAddress,
      permanentAddress,
      districtId,
      careerObjective,
      expectedSalary,
      educations = [],
      experiences = [],
      skills = [],
    } = body;

    // Update User Name
    if (name) {
      await prisma.user.update({
        where: { id: session.userId },
        data: { name },
      });
    }

    // Upsert Candidate Profile
    const profile = await prisma.candidateProfile.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        fatherName,
        motherName,
        dob: dob ? new Date(dob) : null,
        gender,
        nid,
        presentAddress,
        permanentAddress,
        districtId: districtId ? Number(districtId) : null,
        phone: session.phone,
        careerObjective,
        expectedSalary,
      },
      update: {
        fatherName,
        motherName,
        dob: dob ? new Date(dob) : null,
        gender,
        nid,
        presentAddress,
        permanentAddress,
        districtId: districtId ? Number(districtId) : null,
        careerObjective,
        expectedSalary,
      },
    });

    // Update Educations
    if (Array.isArray(educations)) {
      await prisma.education.deleteMany({ where: { userId: session.userId } });
      if (educations.length > 0) {
        await prisma.education.createMany({
          data: educations.map((e: any) => ({
            userId: session.userId,
            exam: e.exam,
            boardOrInstitution: e.boardOrInstitution,
            subjectOrGroup: e.subjectOrGroup,
            result: e.result,
            passingYear: Number(e.passingYear),
          })),
        });
      }
    }

    // Update Experiences
    if (Array.isArray(experiences)) {
      await prisma.experience.deleteMany({ where: { userId: session.userId } });
      if (experiences.length > 0) {
        await prisma.experience.createMany({
          data: experiences.map((exp: any) => ({
            userId: session.userId,
            organization: exp.organization,
            designation: exp.designation,
            duration: exp.duration,
            responsibilities: exp.responsibilities,
          })),
        });
      }
    }

    // Update Skills
    if (Array.isArray(skills)) {
      await prisma.skill.deleteMany({ where: { userId: session.userId } });
      if (skills.length > 0) {
        await prisma.skill.createMany({
          data: skills.map((s: string) => ({
            userId: session.userId,
            skillName: s,
          })),
        });
      }
    }

    // Calculate completeness
    let completeness = 20; // phone + user account
    if (fatherName && motherName && gender) completeness += 20;
    if (districtId && presentAddress) completeness += 10;
    if (educations.length > 0) completeness += 25;
    if (experiences.length > 0) completeness += 15;
    if (skills.length > 0) completeness += 10;
    completeness = Math.min(100, completeness);

    await prisma.candidateProfile.update({
      where: { userId: session.userId },
      data: { completeness },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
      completeness,
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
