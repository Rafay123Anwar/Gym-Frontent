import { gql } from '@apollo/client';

export const MEMBER_FIELDS = gql`
  fragment MemberFields on MemberType {
    id
    fullName
    phoneNumber
    status
    isActive
    joinDate
    startDate
    expiryDate
    daysUntilExpiry
    paidStatus
    membershipPlan {
      id
      planName
      price
    }
  }
`;

export const GET_MEMBERS = gql`
  query GetAllMembers(
    $search: String
    $status: String
    $planId: UUID
    $paidStatus: String
    $page: Int
    $pageSize: Int
    $activeOnly: Boolean
  ) {
    allMembers(
      search: $search
      status: $status
      planId: $planId
      paidStatus: $paidStatus
      page: $page
      pageSize: $pageSize
      activeOnly: $activeOnly
    ) {
      count
      next
      previous
      page
      totalPages
      results {
        ...MemberFields
      }
    }
    allPlans(page: 1, pageSize: 100) {
      results {
        id
        planName
      }
    }
  }
  ${MEMBER_FIELDS}
`;

export const GET_PLANS = gql`
  query GetPlans($page: Int, $pageSize: Int) {
    allPlans(page: $page, pageSize: $pageSize) {
      count
      page
      totalPages
      results {
        id
        planName
        price
        durationMonths
        durationDays
        description
        isActive
      }
    }
  }
`;

export const DASHBOARD_QUERY = gql`
  query DashboardStats {
    dashboardStats {
      totalMembers
      activeMembers
      inactiveMembers
      expiredMembers
      paidMembers
      unpaidMembers
      monthlyRevenue
      annualRevenue
      newMembersThisMonth
      revenueTrend {
        name
        value
      }
      memberGrowth {
        name
        value
      }
    }
    recentPayments(page: 1, pageSize: 5) {
      results {
        id
        amount
        month
        member {
          fullName
        }
      }
    }
    membershipExpiryAlerts(withinDays: 7) {
      memberId
      memberName
      expiryDate
      daysRemaining
      level
      message
    }
  }
`;

export const GET_REPORTS_DATA = gql`
  query GetReportsData {
    dashboardStats {
      totalMembers
      activeMembers
      inactiveMembers
      expiredMembers
      monthlyRevenue
      annualRevenue
      newMembersThisMonth
      revenueTrend {
        name
        value
      }
      memberGrowth {
        name
        value
      }
    }
    recentActivities(page: 1, pageSize: 10) {
      count
      results {
        id
        activityType
        description
        createdAt
        memberName
      }
    }
  }
`;

export const GET_EXPIRY_ALERTS = gql`
  query MembershipExpiryAlerts($withinDays: Int) {
    membershipExpiryAlerts(withinDays: $withinDays) {
      memberId
      memberName
      expiryDate
      daysRemaining
      level
      message
    }
  }
`;

export const GET_EXPIRED_FOR_RENEWAL = gql`
  query GetExpiredForRenewal {
    allMembers(status: "Expired", page: 1, pageSize: 50) {
      count
      results {
        id
        fullName
        phoneNumber
        status
        expiryDate
        membershipPlan {
          planName
          price
        }
      }
    }
  }
`;

export const GET_MEMBER_FOR_RENEW_NAV = gql`
  query RenewMemberLookup($id: UUID!) {
    member(id: $id) {
      id
      fullName
      phoneNumber
      status
      expiryDate
      membershipPlan {
        planName
        price
      }
    }
  }
`;

/** Refetch keys used after mutations for live dashboard sync */
export const LIVE_QUERY_NAMES = [
  'DashboardStats',
  'GetAllMembers',
  'GetReportsData',
  'GetRecentPayments',
  'GetPlans',
  'MembershipExpiryAlerts',
  'GetExpiredForRenewal',
  'RenewMemberLookup',
];
