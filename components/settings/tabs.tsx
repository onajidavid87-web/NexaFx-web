"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountIcon, SecurityIcon } from "../icons";
import { ProfileTab } from "./profile-tab";
import { Security } from "./security";
import { DangerZone } from "./danger-zone";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountIcon, SecurityIcon, IdentityIcon } from "../icons";
import { History, LogIn, KeyRound, Shield, ArrowUpFromLine, UserX, UserCheck, ShieldOff, Edit3, AlertCircle } from "lucide-react";
import { AccountInfo } from "./account-info";
import { Security } from "./security";
import { TwoFactorAuth } from "./two-factor";
import { ActivityLog } from "./activity-log";
import { NotificationPreferences } from "./notification-preferences";
import { ProfileOverview } from "../profile/profile-overview";
import { PersonalInfo } from "../profile/personal-info";
import { VerificationBanner } from "../profile/verification-banner";
import { FAQSection } from "../profile/faq-section";
import { TwoFactorSection } from "../dashboard/settings/two-factor-section";
import { getActivityLog } from "@/lib/api/activity";
import { Pagination } from "@/components/shared/pagination";

export function TabsSettings() {
  const [activeTab, setActiveTab] = useState<string | undefined>();

  return (
    <Tabs
      defaultValue="profile"
      onValueChange={(tab) => setActiveTab(tab)}
    >
      <TabsList variant="line" className="gap-1 sm:gap-2 mb-7.5 sm:mb-9">
        <TabsTrigger value="profile">
          <AccountIcon
            color={activeTab === "profile" ? "#000" : ""}
            className="size-3.5"
          />
          Profile
        </TabsTrigger>
        <TabsTrigger value="security">
          <SecurityIcon
            color={activeTab === "security" ? "#000" : ""}
            className="size-3.5"
          />
          Security
        </TabsTrigger>
        <TabsTrigger value="danger">
          <AlertTriangle
            className="size-3.5"
            color={activeTab === "danger" ? "#E90004" : undefined}
            aria-hidden="true"
          />
          Danger Zone
        </TabsTrigger>
        <TabsTrigger value="activity">
          <History
            color={isActiveTap === "activity" ? "#000" : ""}
            className="size-3.5"
          />
          Activity
        </TabsTrigger>
        <TabsTrigger value="activity">
          <History
            color={isActiveTap === "activity" ? "#000" : ""}
            className="size-3.5"
          />
          Activity
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileTab />
      </TabsContent>
      <TabsContent value="security">
        <div className="rounded-2xl border-[#8C8C8C] border-[0.25px] bg-card">
          <h3 className="text-muted-foreground mb-4.5 font-semibold text-base mx-5 pt-6.25 pb-4.5 dark:text-white dark:border-slate-300 border-[#00000026] border-b">
            Two-Factor Authentication
          </h3>
          <TwoFactorSection />
        </div>
        <div className="mt-6">
          <Security />
        </div>
      </TabsContent>
      <TabsContent value="danger">
        <DangerZone />
      </TabsContent>
      <TabsContent value="activity">
        <ActivityContent />
      </TabsContent>
    </Tabs>
  );
}

function ActivityContent() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const eventIconMap: Record<string, any> = {
    login: LogIn,
    logout: UserX,
    password_changed: KeyRound,
    profile_updated: Edit3,
    '2fa_enabled': Shield,
    '2fa_disabled': ShieldOff,
    withdrawal_submitted: ArrowUpFromLine,
    kyc_verified: UserCheck,
  }

  const PER_PAGE = 20

  useEffect(() => {
    getActivityLog()
      .then(setEvents)
      .catch((err: any) => setError(err instanceof Error ? err.message : "Failed to load activity"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-destructive text-sm">{error}</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-muted-foreground">No activity recorded yet</p>
      </div>
    )
  }

  const totalPages = Math.ceil(events.length / PER_PAGE)
  const paginatedEvents = events.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {paginatedEvents.map((event: any) => {
          const Icon = eventIconMap[event.type] || LogIn
          return (
            <div key={event.id} className="flex items-start gap-3 rounded-lg border bg-card p-4">
              <div className="mt-0.5 rounded-full bg-muted p-2">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{event.description}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                  {event.ipAddress && <span>IP: {event.ipAddress}</span>}
                  {event.deviceInfo && <span>{event.deviceInfo}</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(event.createdAt).toLocaleString()}
                </p>
              </div>
              {event.type === "login" && (
                <button className="shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted">
                  This was not me
                </button>
              )}
            </div>
          )
        })}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
