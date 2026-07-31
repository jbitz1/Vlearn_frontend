import React, { useState } from 'react';
import { CreditCard, Calendar, Users, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';
import { useSchoolContext } from '../../Context/SchoolContext';
import PageHeader from '../../Components/School/PageHeader';
import SchoolCheckoutModal from '../../Components/School/SchoolCheckoutModal';

export function SchoolSubscriptionPage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const {
    subscription,
    teachers,
    pendingInvitations,
    enrollments,
    isLoading,
  } = useSchoolContext();

  const maxTeachers = subscription?.max_teachers || 10;
  const maxStudents = subscription?.max_students || 500;

  const activeTeachersCount = teachers.length + pendingInvitations.length;
  const activeStudentsCount = enrollments.filter((e) => e.status === 'active').length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Subscription"
          subtitle="Manage plan entitlements and view capacity limits"
        />
        <button
          onClick={() => setIsCheckoutOpen(true)}
          className="flex items-center gap-2 bg-custom-blue text-white px-5 py-2.5 rounded-xl font-bold hover:bg-custom-orange transition shadow-sm text-sm"
        >
          Upgrade / Renew Plan <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Plan Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-custom-blue rounded-2xl">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-gray-400 uppercase">Current Plan</span>
                  <h2 className="text-xl font-extrabold text-gray-900 mt-0.5">
                    {subscription?.plan_name || 'Standard School Subscription'}
                  </h2>
                </div>
              </div>

              {subscription?.is_active !== false ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase">
                  Inactive
                </span>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                Expiration Date
              </span>
              <span className="font-bold text-gray-900">
                {subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Subscription Term Dates */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-custom-blue rounded-2xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-gray-400 uppercase">Subscription Term</span>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">
                  {subscription?.start_date ? new Date(subscription.start_date).toLocaleDateString() : 'N/A'} — {' '}
                  {subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'N/A'}
                </h3>
              </div>
            </div>
          </div>

          {/* Teachers Plain Capacity */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-custom-blue rounded-2xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-gray-400 uppercase">Teachers</span>
                <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                  {activeTeachersCount} / {maxTeachers}
                </h3>
              </div>
            </div>
          </div>

          {/* Students Plain Capacity */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-custom-blue rounded-2xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-gray-400 uppercase">Students</span>
                <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                  {activeStudentsCount} / {maxStudents}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}

      <SchoolCheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </div>
  );
}

export default SchoolSubscriptionPage;
