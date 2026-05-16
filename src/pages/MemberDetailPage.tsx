import { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Save, Phone, Calendar, CreditCard, FileText, CheckCircle, AlertCircle, History, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { useModalStore } from '../store/modalStore';
import { LIVE_QUERY_NAMES } from '../graphql/queries';
import Pagination from '../components/Pagination';

const GET_MEMBER_FULL = gql`
  query GetMemberFull($id: UUID!, $page: Int, $pageSize: Int) {
    member(id: $id) {
      id
      fullName
      phoneNumber
      fatherName
      cnic
      address
      notes
      joinDate
      expiryDate
      status
      paidStatus
      membershipPlan {
        id
        planName
        price
      }
    }
    recentPayments(page: $page, pageSize: $pageSize, memberId: $id) {
      count
      page
      totalPages
      results {
        id
        amount
        month
        paymentDate
        member { id }
      }
    }
  }
`;

const UPDATE_MEMBER = gql`
  mutation UpdateMember($id: UUID!, $input: UpdateMemberInput!) {
    updateMember(memberId: $id, input: $input) {
      id
      fullName
    }
  }
`;

const DELETE_MEMBER = gql`
  mutation DeleteMember($id: UUID!) {
    deleteMember(memberId: $id)
  }
`;

const DELETE_PAYMENT = gql`
  mutation DeletePayment($id: UUID!) {
    deletePayment(paymentId: $id)
  }
`;

interface Member {
  id: string;
  fullName: string;
  phoneNumber: string;
  fatherName: string | null;
  cnic: string | null;
  address: string | null;
  notes: string | null;
  joinDate: string;
  expiryDate: string;
  status: string;
  paidStatus: string;
  membershipPlan: {
    id: string;
    planName: string;
    price: number;
  };
}

interface Payment {
  id: string;
  amount: number;
  month: string;
  paymentDate: string;
  member: { id: string };
}

interface MemberFormData {
  fullName: string;
  phoneNumber: string;
  address: string;
  notes: string;
  status: string;
  expiryDate: string;
  joinDate: string;
}

export default function MemberDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showConfirm, showAlert } = useModalStore();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Partial<MemberFormData>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const today = dayjs().format('YYYY-MM-DD');

  const { data, loading, refetch } = useQuery(GET_MEMBER_FULL, {
    variables: { id, page: currentPage, pageSize },
    onCompleted: (data) => {
      if (data?.member) {
        setFormData({
          fullName: data.member.fullName,
          phoneNumber: data.member.phoneNumber,
          address: data.member.address || '',
          notes: data.member.notes || '',
          status: data.member.status,
          expiryDate: data.member.expiryDate,
          joinDate: data.member.joinDate
        });
      }
    }
  });

  const [updateMember, { loading: updating }] = useMutation(UPDATE_MEMBER, {
    refetchQueries: [...LIVE_QUERY_NAMES, 'GetMemberFull'],
  });
  const [deleteMember] = useMutation(DELETE_MEMBER, {
    refetchQueries: [...LIVE_QUERY_NAMES, 'GetMemberFull'],
  });
  const [deletePayment] = useMutation(DELETE_PAYMENT, {
    refetchQueries: [...LIVE_QUERY_NAMES, 'GetMemberFull'],
  });

  const validatePhone = (phone: string) => {
    return phone.match(/^(\+923\d{9}|03\d{9})$/);
  };

  const handleSave = async () => {
    setError('');
    if (!validatePhone(formData.phoneNumber || '')) {
      setError('Invalid Pakistani number. Format: +923XXXXXXXXX');
      return;
    }

    if (dayjs(formData.joinDate).isBefore(dayjs(), 'day')) {
      setError('Join date cannot be in the past.');
      return;
    }

    try {
      await updateMember({
        variables: {
          id,
          input: {
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            address: formData.address,
            notes: formData.notes,
            status: formData.status,
            expiryDate: formData.expiryDate,
            joinDate: formData.joinDate
          }
        },
        optimisticResponse: {
          updateMember: {
            __typename: "MemberType",
            id: id,
            fullName: formData.fullName,
            status: formData.status,
            expiryDate: formData.expiryDate,
            joinDate: formData.joinDate
          }
        }
      });
      setIsEditing(false);
      refetch();
    } catch (err: any) {
      if (err.message.includes('unique constraint') || err.message.includes('already exists')) {
        setError('This mobile number is already assigned to another member.');
      } else {
        setError(err.message);
      }
    }
  };

  const handleDelete = async () => {
    const name = data?.member?.fullName ?? 'this member';
    showConfirm({
      title: '⚠️ Delete Member',
      message: `Are you sure you want to permanently delete ${name}?\n\nThis action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await deleteMember({
            variables: { id },
          });
          navigate('/members');
        } catch {
          showAlert({ title: 'Error', message: 'Failed to delete member', type: 'error' });
        }
      },
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary shadow-[0_0_15px_rgba(212,175,55,0.2)]"></div>
    </div>
  );
  if (!data?.member) return <div className="p-8 glass-panel text-red-400 border-red-500/20">Member record not found.</div>;

  const member = data.member as Member;
  const pageData = data.recentPayments;
  const payments = ((pageData?.results as Payment[]) || []);
  const totalCount = pageData?.count ?? 0;
  const totalPages = pageData?.totalPages ?? 1;
  const daysLeft = Math.ceil((new Date(member.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button onClick={() => navigate('/members')} className="flex items-center text-textMuted hover:text-textMain transition-all group">
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-[10px]">Back to Records</span>
        </button>
        <div className="flex gap-2 w-full sm:w-auto">
          {!isEditing ? (
            <>
              <button onClick={() => setIsEditing(true)} className="btn-secondary flex-1 sm:flex-none flex items-center justify-center">
                <Edit2 className="w-4 h-4 mr-2" /> <span>Edit</span>
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-400/5 text-red-400 border border-red-400/20 rounded-xl hover:bg-red-400/10 transition-all flex-1 sm:flex-none flex items-center justify-center font-bold">
                <Trash2 className="w-4 h-4 mr-2" /> <span>Delete</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(false)} className="btn-secondary px-6 flex-1 sm:flex-none">Cancel</button>
              <button onClick={handleSave} disabled={updating} className="btn-primary flex-1 sm:flex-none flex items-center justify-center px-6">
                {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                <span>Save</span>
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-2xl ${
                member.status === 'Active'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : member.status === 'Expired'
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : 'bg-gray-500/10 text-textMuted border-gray-500/20'
              }`}>
                {member.status}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-2xl relative group">
                <span className="text-4xl font-black text-textMain">{member.fullName.charAt(0)}</span>
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-center sm:text-left">
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-textMuted uppercase tracking-widest">Full Name</label>
                      <input type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="input-field" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-textMuted uppercase tracking-widest">Status</label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                        className="input-field"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Expired">Expired</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl sm:text-4xl font-black text-textMain tracking-tight">{member.fullName}</h1>
                    <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mt-1">{member.membershipPlan.planName} MEMBER</p>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-white/5">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Contact Number
                  </p>
                  {isEditing ? (
                    <input type="text" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} className="input-field" />
                  ) : (
                    <p className="text-textMain font-black tracking-tight">{member.phoneNumber}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Registration History
                  </p>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-textMuted uppercase tracking-widest">Joined On</label>
                        <input type="date" min={today} value={formData.joinDate} onChange={e => setFormData({ ...formData, joinDate: e.target.value })} className="input-field text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-textMuted uppercase tracking-widest">Expires On</label>
                        <input type="date" min={today} value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} className="input-field text-xs" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-textMain font-medium">Joined on <span className="font-black text-primary">{member.joinDate}</span></p>
                      <p className="text-sm text-textMuted font-medium">Expires on <span className={`font-black ${daysLeft < 0 ? 'text-red-400 underline decoration-red-400/30 underline-offset-4' : 'text-textMain'}`}>{member.expiryDate}</span></p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-2 flex items-center gap-2">
                    <CreditCard className="w-3 h-3" /> National ID (CNIC)
                  </p>
                  <p className="text-textMain font-black tracking-tight">{member.cnic || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-2 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" /> Financial Status
                  </p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${member.paidStatus === 'Paid' ? 'text-emerald-400 bg-emerald-400/10' : 'text-orange-400 bg-orange-400/10'}`}>
                    {member.paidStatus.toUpperCase()} FOR CURRENT MONTH
                  </span>
                </div>
              </div>

              <div className="md:col-span-2">
                <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-2 flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Notes & Preferences
                </p>
                {isEditing ? (
                  <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="input-field h-24" />
                ) : (
                  <p className="text-sm text-textMuted leading-relaxed italic">{member.notes || 'No custom notes for this member.'}</p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-6 sm:p-8">
            <h3 className="text-lg font-black text-textMain mb-6 flex items-center gap-3">
              <History className="w-5 h-5 text-primary" /> Payment Ledger
            </h3>
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <table className="w-full text-left min-w-[500px]">
                <thead className="border-b border-borderLine text-[10px] font-black text-textMuted uppercase tracking-widest">
                  <tr>
                    <th className="py-4 px-6 sm:px-0">Billing Month</th>
                    <th className="py-4">Amount</th>
                    <th className="py-4">Transaction Date</th>
                    <th className="py-4 pr-6 sm:pr-0 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.length === 0 ? (
                    <tr><td colSpan={4} className="py-10 text-center text-textMuted text-xs">No transactions recorded yet.</td></tr>
                  ) : payments.map((p: Payment) => (
                    <tr key={p.id}>
                      <td className="py-4 px-6 sm:px-0 text-sm text-textMain font-black tracking-tight">{new Date(p.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</td>
                      <td className="py-4 text-sm text-emerald-400 font-black">Rs.{p.amount.toLocaleString()}</td>
                      <td className="py-4 text-xs text-textMuted font-bold uppercase">{p.paymentDate}</td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={async () => {
                            showConfirm({
                              title: 'Reverse Transaction',
                              message: 'Are you sure you want to reverse this transaction?',
                              confirmText: 'Yes, Reverse',
                              onConfirm: async () => {
                                await deletePayment({ 
                                  variables: { id: p.id },
                                  optimisticResponse: {
                                    deletePayment: true
                                  }
                                });
                                refetch();
                              }
                            });
                          }}
                          className="p-2 text-textMuted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              count={totalCount}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </motion.div>
        </div>

        {/* Status Sidebar */}
        <div className="space-y-6">
          <div className={`glass-panel p-6 border-l-4 ${daysLeft < 0 ? 'border-red-500' : 'border-emerald-500'}`}>
            <h4 className="text-xs font-black text-textMuted uppercase tracking-widest mb-2">Membership Status</h4>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-black tracking-tighter ${daysLeft < 0 ? 'text-red-400' : 'text-textMain'}`}>
                {daysLeft < 0 ? 'EXPIRED' : daysLeft}
              </span>
              {daysLeft >= 0 && <span className="text-xs text-textMuted font-black mb-1.5 uppercase tracking-widest">DAYS LEFT</span>}
            </div>
            <p className="text-[10px] text-textMuted mt-4 leading-relaxed">
              Based on the registration date and selected {member.membershipPlan.planName} plan.
            </p>
          </div>

          <div className="glass-panel p-6">
            <h4 className="text-xs font-black text-textMuted uppercase tracking-widest mb-4">Quick Actions</h4>
            <div className="space-y-3">
              {member.status === 'Expired' ? (
                <button
                  type="button"
                  onClick={() => navigate(`/payments?renew=${member.id}`)}
                  className="w-full py-3 text-xs font-bold rounded-xl bg-orange-500/15 text-orange-300 border border-orange-500/30 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  RENEW ON PAYMENTS PAGE
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const newStatus = member.status === 'Active' ? 'Inactive' : 'Active';
                    showConfirm({
                      title: 'Update Status',
                      message: `Change member status to ${newStatus}?`,
                      confirmText: `Yes, ${newStatus}`,
                      onConfirm: async () => {
                        await updateMember({
                          variables: { id, input: { status: newStatus } },
                        });
                        refetch();
                      },
                    });
                  }}
                  className={`w-full py-3 text-xs font-bold rounded-xl transition-all border ${
                    member.status === 'Active'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                  }`}
                >
                  {member.status === 'Active' ? 'DEACTIVATE MEMBER' : 'ACTIVATE MEMBER'}
                </button>
              )}
              <button className="w-full py-3 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/20 transition-all border border-primary/20">
                SEND FEE REMINDER
              </button>
              <button className="w-full py-3 bg-secondary text-textMain text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-surface transition-all border border-borderLine">
                PRINT MEMBERSHIP CARD
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
