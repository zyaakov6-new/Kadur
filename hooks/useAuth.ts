import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { User, AuthProvider as AuthProviderType, CreateProfileInput } from '@/types';
import * as Storage from '@/services/storage';
import { registerForPushNotifications } from '@/services/notifications';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => Storage.getCurrentUser(),
  });

  const signInMutation = useMutation({
    mutationFn: async (params: {
      provider: AuthProviderType;
      phoneNumber?: string;
      email?: string;
    }) => {
      const existing = await Storage.getCurrentUser();
      if (existing) return existing;

      const user: User = {
        id: Storage.generateId(),
        provider: params.provider,
        phoneNumber: params.phoneNumber,
        email: params.email,
        name: '',
        city: 'ירושלים',
        age: 0,
        position: 'midfield',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await Storage.saveUser(user);

      const token = await registerForPushNotifications();
      if (token) {
        user.pushToken = token;
        await Storage.saveUser(user);
      }

      console.log('[Auth] User signed in:', user.id, 'via', params.provider);
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (input: CreateProfileInput) => {
      const current = await Storage.getCurrentUser();
      if (!current) throw new Error('No user found');

      const updated: User = {
        ...current,
        name: input.name,
        city: input.city,
        age: input.age,
        position: input.position,
        avatarUrl: input.avatarUrl,
        updatedAt: Date.now(),
      };
      await Storage.saveUser(updated);
      console.log('[Auth] Profile updated for:', updated.id);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      await Storage.clearUser();
      console.log('[Auth] User signed out');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  const user = userQuery.data ?? null;
  const isLoading = userQuery.isLoading;
  const isProfileComplete = Boolean(user && user.name && user.age > 0);

  return {
    user,
    isLoading,
    isProfileComplete,
    signIn: signInMutation,
    updateProfile: updateProfileMutation,
    signOut: signOutMutation,
  };
});
