import { supabase } from "@/lib/supabase";
import {
  StudioRoom,
  StudioProfile,
  RehearsalAssignment,
  TeacherComment,
  StudioMembership,
} from "../types";
import {
  studios as devStudios,
  studioProfiles as devStudioProfiles,
  assignments as devAssignments,
  teacherComments as devTeacherComments,
} from "../data/devFixtures";
import { assertConfigured, shouldUseFixtures } from "./config";

export const tranceStudioService = {
  getStudios: async (): Promise<StudioRoom[]> => {
    assertConfigured("StudioService");
    if (shouldUseFixtures()) {
      return devStudios;
    }
    const { data, error } = await supabase.from("trance_studio_rooms").select("*");

    if (error) throw error;
    return (data as StudioRoom[]) || [];
  },

  getStudioProfile: async (studioId: string): Promise<StudioProfile> => {
    assertConfigured("StudioService");
    const fallback = devStudioProfiles.find((s) => s.id === studioId) || devStudioProfiles[0];
    if (shouldUseFixtures()) {
      return fallback;
    }
    const { data, error } = await supabase
      .from("trance_studio_profiles")
      .select("*")
      .eq("id", studioId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error(`Studio profile not found for id: ${studioId}`);
    return data as StudioProfile;
  },

  getRehearsalAssignments: async (studioId: string): Promise<RehearsalAssignment[]> => {
    assertConfigured("StudioService");
    if (shouldUseFixtures()) {
      return devAssignments;
    }
    const { data, error } = await supabase
      .from("trance_rehearsal_assignments")
      .select("*")
      .eq("studio_id", studioId)
      .order("due_date", { ascending: true });

    if (error) throw error;
    return (data as RehearsalAssignment[]) || [];
  },

  getTeacherComments: async (studioId: string, roomId: string): Promise<TeacherComment[]> => {
    assertConfigured("StudioService");
    if (shouldUseFixtures()) {
      return devTeacherComments.filter((c) => c.studioId === studioId);
    }
    const { data, error } = await supabase
      .from("trance_teacher_comments")
      .select("*")
      .eq("studio_id", studioId)
      .eq("room_id", roomId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as unknown as TeacherComment[]) || [];
  },

  addTeacherComment: async (comment: Partial<TeacherComment>): Promise<void> => {
    assertConfigured("StudioService");
    if (shouldUseFixtures()) {
      console.log("[Dev Mode] Mock add teacher comment:", comment);
      return;
    }
    const { error } = await supabase.from("trance_teacher_comments").insert({
      studio_id: comment.studioId,
      room_id: comment.roomId,
      choreographer_id: comment.choreographerId,
      comment: comment.comment,
      audio_url: comment.audioUrl,
    });

    if (error) throw error;
  },

  getMemberships: async (studioId: string): Promise<StudioMembership[]> => {
    assertConfigured("StudioService");
    if (shouldUseFixtures()) {
      return [
        {
          id: "mem1",
          studioId,
          userId: "u001",
          role: "studio_owner",
          joinedAt: new Date().toISOString(),
        },
      ];
    }
    const { data, error } = await supabase
      .from("trance_studio_memberships")
      .select("*")
      .eq("studio_id", studioId);

    if (error) throw error;
    return (data as StudioMembership[]) || [];
  },

  createStudioRoom: async (
    studioId: string,
    name: string,
    capacity: number,
    locked: boolean,
    tagline: string,
  ): Promise<StudioRoom> => {
    assertConfigured("StudioService");
    const defaultRoom: StudioRoom = {
      id: "room-" + Math.random().toString(36).substr(2, 9),
      name,
      cover: "",
      locked,
      members: 0,
      capacity,
      status: "OPEN",
      tagline,
    };

    if (shouldUseFixtures()) {
      return defaultRoom;
    }

    const { data, error } = await supabase
      .from("trance_studio_rooms")
      .insert({
        studio_id: studioId,
        name,
        capacity,
        locked,
        tagline,
        status: "OPEN",
      })
      .select("*")
      .maybeSingle();

    if (error) throw error;
    return (data as StudioRoom) || defaultRoom;
  },

  getStudioRoomsForUser: async (userId: string): Promise<StudioRoom[]> => {
    assertConfigured("StudioService");
    if (shouldUseFixtures()) {
      return devStudios;
    }
    const { data: memberships, error: memErr } = await supabase
      .from("trance_studio_memberships")
      .select("studio_id")
      .eq("user_id", userId);

    if (memErr) throw memErr;
    if (!memberships || memberships.length === 0) return [];

    const studioIds = memberships.map((m: any) => m.studio_id);

    const { data, error } = await supabase
      .from("trance_studio_rooms")
      .select("*")
      .in("studio_id", studioIds);

    if (error) throw error;
    return (data as StudioRoom[]) || [];
  },

  getStudioRoomById: async (roomId: string): Promise<StudioRoom | null> => {
    assertConfigured("StudioService");
    if (shouldUseFixtures()) {
      return devStudios.find((s) => s.id === roomId) || null;
    }
    const { data, error } = await supabase
      .from("trance_studio_rooms")
      .select("*")
      .eq("id", roomId)
      .maybeSingle();

    if (error) throw error;
    return (data as StudioRoom) || null;
  },

  addStudioMember: async (
    studioId: string,
    userId: string,
    role: "studio_owner" | "studio_admin" | "studio_member",
  ): Promise<void> => {
    assertConfigured("StudioService");
    if (shouldUseFixtures()) {
      console.log(`[Dev Mode] Mock add user ${userId} to studio ${studioId} as ${role}`);
      return;
    }
    const { error } = await supabase.from("trance_studio_memberships").insert({
      studio_id: studioId,
      user_id: userId,
      role,
    });

    if (error) throw error;
  },
};
