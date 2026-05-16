
import { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import {
  Search,
  Plus,
  Filter,
  Trash2,
  Edit3,
  Loader2,
  ChevronDown
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import AddMemberModal from '../components/AddMemberModal';
import Pagination from '../components/Pagination';
import { GET_MEMBERS, LIVE_QUERY_NAMES } from '../graphql/queries';
import { useModalStore } from '../store/modalStore';

function statusBadgeClass(status: string) {
  if (status === 'Active') return 'rgba(16,185,129,0.15)';
  if (status === 'Expired') return 'rgba(239,68,68,0.15)';
  return 'rgba(107,114,128,0.15)';
}

function statusTextClass(status: string) {
  if (status === 'Active') return 'text-emerald-400';
  if (status === 'Expired') return 'text-red-400';
  return 'text-textMuted';
}

const DELETE_MEMBER = gql`
  mutation DeleteMember($id: UUID!) {
    deleteMember(memberId: $id)
  }
`;

const UPDATE_MEMBER = gql`
  mutation UpdateMember($id: UUID!, $input: UpdateMemberInput!) {
    updateMember(memberId: $id, input: $input) {
      id
      status
    }
  }
`;

interface MemberSummary {
  id: string;
  fullName: string;
  phoneNumber: string;
  status: string;
  joinDate: string;
  expiryDate: string;
  paidStatus: string;
  membershipPlan: {
    id: string;
    planName: string;
    price: number;
  };
}

interface PlanSummary {
  id: string;
  planName: string;
}

export default function MembersPage() {
  const navigate = useNavigate();
  const { showConfirm } = useModalStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [paidFilter, setPaidFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, loading, error, refetch } = useQuery(GET_MEMBERS, {
    variables: {
      search: searchTerm || null,
      status: statusFilter || null,
      planId: planFilter || null,
      paidStatus: paidFilter || null,
      page: currentPage,
      pageSize,
    },
    fetchPolicy: 'cache-and-network',
  });

  const pageData = data?.allMembers;
  const members = pageData?.results || [];
  const totalCount = pageData?.count ?? 0;
  const totalPages = pageData?.totalPages ?? 1;

  const [deleteMember] = useMutation(DELETE_MEMBER, {
    refetchQueries: LIVE_QUERY_NAMES,
    onCompleted: () => refetch(),
  });

  const [updateMember] = useMutation(UPDATE_MEMBER, {
    refetchQueries: LIVE_QUERY_NAMES,
  });

  const handleStatusToggle = async (
    e: React.MouseEvent,
    id: string,
    currentStatus: string
  ) => {
    e.stopPropagation();

    if (currentStatus === 'Expired') return;

    const newStatus =
      currentStatus === 'Active' ? 'Inactive' : 'Active';

    showConfirm({
      title: 'Update Status',
      message: `Are you sure you want to ${newStatus.toLowerCase()} this member?`,
      confirmText: `Yes, ${newStatus}`,

      onConfirm: async () => {
        await updateMember({
          variables: {
            id,
            input: {
              status: newStatus,
            },
          },
        });

        refetch();
      },
    });
  };

  const handleDelete = async (
    e: React.MouseEvent,
    id: string,
    fullName: string
  ) => {
    e.stopPropagation();

    showConfirm({
      title: '⚠️ Delete Member',
      message:
        `Are you sure you want to permanently delete ${fullName}?\n\nThis action cannot be undone.`,
      cancelText: 'Cancel',
      confirmText: 'Delete',

      onConfirm: async () => {
        await deleteMember({
          variables: { id },
        });

        refetch();
      },
    });
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">

        <div>
          <h1 className="text-3xl font-black text-textMain tracking-tight">
            Members
          </h1>

          <p className="text-sm text-textMuted font-bold uppercase tracking-widest mt-1">
            Member Directory · {totalCount} total
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center justify-center w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Member
        </button>
      </div>

      {/* SEARCH */}

      <div className="space-y-4">

        <div className="glass-panel p-3 flex flex-col lg:flex-row gap-4">

          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />

            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field pl-12"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center justify-center"
          >
            <Filter className="w-5 h-5 mr-2" />

            Filters

            <ChevronDown
              className={`ml-2 w-4 h-4 transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* FILTERS */}

        <AnimatePresence>

          {showFilters && (

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >

              <div className="glass-panel p-6 grid grid-cols-1 md:grid-cols-3 gap-4">

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input-field"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Expired">Expired</option> 
                </select>

                <select
                  value={planFilter}
                  onChange={(e) => {
                    setPlanFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input-field"
                >
                  <option value="">All Plans</option>

                  {data?.allPlans?.results?.map((plan: PlanSummary) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.planName}
                    </option>
                  ))}
                </select>

                <select
                  value={paidFilter}
                  onChange={(e) => {
                    setPaidFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input-field"
                >
                  <option value="">All Payments</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Expired">Expired</option>
                </select>

              </div>

            </motion.div>

          )}

        </AnimatePresence>

      </div>

      {/* LOADING */}

      {loading ? (

        <div className="flex flex-col items-center justify-center py-20 gap-4">

          <Loader2 className="w-12 h-12 animate-spin text-primary" />

          <p className="text-textMuted">
            Loading members...
          </p>

        </div>

      ) : error ? (

        <div className="glass-panel p-6 text-red-400">
          {error.message}
        </div>

      ) : (

        <>

          {/* MOBILE */}

          <div className="lg:hidden space-y-4">

            {members.length === 0 ? (

              <div className="glass-panel p-10 text-center text-textMuted">
                <p className="font-black text-textMain mb-1">No members found</p>
                <p className="text-sm">Try adjusting search or filters</p>
              </div>

            ) : (

              members.map((member: MemberSummary) => (

                <div
                  key={member.id}
                  onClick={() => navigate(`/members/${member.id}`)}
                  className="glass-panel p-5 space-y-4 active:scale-[0.98] transition-all"
                >

                  <div className="flex items-center justify-between">

                    <div>
                      <h3 className="font-black text-textMain">
                        {member.fullName}
                      </h3>

                      <p className="text-sm text-textMuted">
                        {member.phoneNumber}
                      </p>
                    </div>

                    <button
                      onClick={(e) =>
                        handleDelete(e, member.id, member.fullName)
                      }
                      className="p-2 rounded-xl border"
                      style={{
                        borderColor:
                          'rgba(239,68,68,0.2)',
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>

                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <p className="text-xs text-textMuted">
                        Plan
                      </p>

                      <p className="font-bold text-textMain">
                        {member.membershipPlan.planName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-textMuted">
                        Status
                      </p>

                      <span
                        className={`font-bold ${statusTextClass(member.status)}`}
                      >
                        {member.status}
                      </span>
                    </div>

                  </div>

                </div>

              ))

            )}

          </div>

          {/* DESKTOP */}

          <div className="hidden lg:block glass-panel overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-borderLine">

                    <th className="p-6 text-left">
                      Member
                    </th>

                    <th className="p-6 text-left">
                      Phone
                    </th>

                    <th className="p-6 text-left">
                      Plan
                    </th>

                    <th className="p-6 text-left">
                      Expiry
                    </th>

                    <th className="p-6 text-left">
                      Status
                    </th>

                    <th className="p-6 text-right">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {members.map(
                    (
                      member: MemberSummary,
                      i: number
                    ) => (

                      <motion.tr
                        key={member.id}
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: i * 0.03,
                        }}
                        onClick={() =>
                          navigate(`/members/${member.id}`)
                        }
                        className="border-b border-borderLine hover:bg-[rgba(212,175,55,0.03)] cursor-pointer transition-all"
                      >

                        <td className="p-6 font-black text-textMain">
                          {member.fullName}
                        </td>

                        <td className="p-6 text-textMuted">
                          {member.phoneNumber}
                        </td>

                        <td className="p-6">
                          {member.membershipPlan.planName}
                        </td>

                        <td className="p-6">
                          <span
                            className={
                              new Date(member.expiryDate) < new Date()
                                ? 'text-red-400 font-bold'
                                : ''
                            }
                          >
                            {member.expiryDate}
                          </span>
                        </td>

                        <td className="p-6">
                          {member.status === 'Expired' ? (
                            <span
                              className="px-3 py-1 rounded-xl text-xs font-bold text-red-400"
                              style={{ backgroundColor: statusBadgeClass('Expired') }}
                            >
                              Expired
                            </span>
                          ) : (
                            <button
                              onClick={(e) =>
                                handleStatusToggle(
                                  e,
                                  member.id,
                                  member.status
                                )
                              }
                              className={`px-3 py-1 rounded-xl text-xs font-bold ${statusTextClass(member.status)}`}
                              style={{
                                backgroundColor: statusBadgeClass(member.status),
                              }}
                            >
                              {member.status}
                            </button>
                          )}
                        </td>

                        <td className="p-6">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={(e) => {
                                e.stopPropagation();

                                navigate(
                                  `/members/${member.id}`
                                );
                              }}
                              className="p-2 rounded-xl"
                            >
                              <Edit3 className="w-4 h-4 text-primary" />
                            </button>

                            <button
                              onClick={(e) =>
                                handleDelete(e, member.id, member.fullName)
                              }
                              className="p-2 rounded-xl"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>

                          </div>

                        </td>

                      </motion.tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            count={totalCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />


        </>

      )}

      <AddMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />

    </div>
  );
}
