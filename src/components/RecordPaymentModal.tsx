import { useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { X, CreditCard, Search, Check, Loader2, Calendar, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import { LIVE_QUERY_NAMES } from '../graphql/queries';

const GET_MEMBERS_SIMPLE = gql`
  query GetMembersSimple($search: String) {
    allMembers(search: $search, page: 1, pageSize: 30) {
      results {
        id
        fullName
        phoneNumber
        paidStatus
        status
        membershipPlan {
          planName
          price
        }
      }
    }
  }
`;

const CREATE_PAYMENT = gql`
  mutation CreatePayment(
    $memberId: UUID!
    $amount: Float!
    $monthStr: String!
    $renewMembership: Boolean!
  ) {
    createPayment(
      memberId: $memberId
      amount: $amount
      monthStr: $monthStr
      renewMembership: $renewMembership
    )
  }
`;

export type RenewalPrefill = {
  id: string;
  fullName: string;
  phoneNumber: string;
  expiryDate: string;
  status: string;
  paidStatus?: string;
  membershipPlan: {
    planName: string;
    price: number;
  };
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** When set (e.g. from Payments renewed list), modal records a renewal payment */
  renewalPrefill?: RenewalPrefill | null;
};

export default function RecordPaymentModal({ isOpen, onClose, onSuccess, renewalPrefill }: Props) {
  const [memberSearch, setMemberSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedMember, setSelectedMember] = useState<RenewalPrefill | null>(null);
  const [error, setError] = useState('');
  const currentMonthStr = dayjs().format('YYYY-MM');

  const { data: membersData, loading: membersLoading } = useQuery(GET_MEMBERS_SIMPLE, {
    variables: { search: memberSearch },
    skip: !showSuggestions || memberSearch.length < 2 || renewalPrefill !== null,
  });

  const [createPayment, { loading: saving }] = useMutation(CREATE_PAYMENT, {
    refetchQueries: LIVE_QUERY_NAMES,
  });

  const [formData, setFormData] = useState({
    amount: '',
    monthStr: dayjs().startOf('month').format('YYYY-MM-DD'),
  });

  useEffect(() => {
    if (!isOpen) return;
    if (renewalPrefill) {
      setSelectedMember(renewalPrefill);
      setMemberSearch(renewalPrefill.fullName);
      setShowSuggestions(false);
      setFormData({
        amount: String(renewalPrefill.membershipPlan.price),
        monthStr: dayjs().startOf('month').format('YYYY-MM-DD'),
      });
      setError('');
      return;
    }
    setSelectedMember(null);
    setMemberSearch('');
    setShowSuggestions(false);
    setFormData({
      amount: '',
      monthStr: dayjs().startOf('month').format('YYYY-MM-DD'),
    });
    setError('');
  }, [isOpen, renewalPrefill]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleSelectMember = (member: RenewalPrefill) => {
    setSelectedMember(member);
    setMemberSearch(member.fullName);
    setShowSuggestions(false);
    setFormData({
      ...formData,
      amount: member.membershipPlan.price.toString(),
    });
  };

  const validate = () => {
    if (!selectedMember) {
      setError('Please select a member first.');
      return false;
    }

    const selectedMonth = dayjs(formData.monthStr).startOf('month');
    const todayMonth = dayjs().startOf('month');

    if (selectedMonth.isBefore(todayMonth)) {
      setError('Past months are not allowed for fee payment.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    const effectiveRenew =
      !!(renewalPrefill?.id === selectedMember?.id || selectedMember?.status === 'Expired');

    try {
      await createPayment({
        variables: {
          memberId: selectedMember!.id,
          amount: parseFloat(formData.amount),
          monthStr: formData.monthStr,
          renewMembership: effectiveRenew,
        },
      });
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment failed';
      setError(msg);
    }
  };

  const showExpirySearchList = !renewalPrefill && showSuggestions && memberSearch.length >= 2;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-surface border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {renewalPrefill ? (
                    <RefreshCw className="w-6 h-6 text-orange-400" />
                  ) : (
                    <CreditCard className="w-6 h-6 text-primary" />
                  )}
                  {renewalPrefill ? 'Renew membership' : 'Fee payment'}
                </h2>
                <p className="text-textMuted text-xs mt-1">
                  {renewalPrefill
                    ? 'Record payment — start date updates to payment date'
                    : 'Log a payment (expired members require renewal toggle via selection)'}
                </p>
              </div>
              <button type="button" onClick={handleClose} className="p-2 hover:bg-white/10 rounded-xl text-textMuted hover:text-white transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                  <X className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {selectedMember?.status === 'Expired' && (
                <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/10 text-sm text-orange-200">
                  Expired on <strong>{selectedMember.expiryDate}</strong> — this payment renews membership: start =
                  payment date (today), expiry recalculated from plan.
                </div>
              )}

              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Member *</label>
                {!renewalPrefill ? (
                  <>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                      <input
                        type="text"
                        className="input-field pl-12"
                        placeholder="Search active or expired members..."
                        value={memberSearch}
                        onChange={(e) => {
                          setMemberSearch(e.target.value);
                          setShowSuggestions(true);
                          if (!e.target.value) setSelectedMember(null);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                      />
                      {selectedMember && (
                        <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                      )}
                    </div>

                    <AnimatePresence>
                      {showExpirySearchList && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-20 left-0 right-0 mt-2 glass-panel border-white/10 overflow-hidden shadow-2xl max-h-60 overflow-y-auto"
                        >
                          {membersLoading ? (
                            <div className="p-4 flex justify-center">
                              <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            </div>
                          ) : (
                            membersData?.allMembers?.results?.map((member: RenewalPrefill) => (
                              <button
                                key={member.id}
                                type="button"
                                disabled={
                                  member.status !== 'Expired' &&
                                  member.paidStatus === 'Paid' &&
                                  formData.monthStr.substring(0, 7) === new Date().toISOString().substring(0, 7)
                                }
                                onClick={() => handleSelectMember(member)}
                                className={`w-full p-4 flex justify-between items-center border-b border-white/5 last:border-0 transition-colors ${
                                  member.paidStatus === 'Paid' && member.status !== 'Expired'
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-white/5'
                                }`}
                              >
                                <div className="flex flex-col items-start">
                                  <span className="font-bold text-white text-sm">{member.fullName}</span>
                                  <span className="text-xs text-textMuted">
                                    {member.phoneNumber} — {member.membershipPlan.planName}
                                  </span>
                                </div>
                                {member.status === 'Expired' ? (
                                  <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-black rounded border border-red-500/20 uppercase">
                                    Expired
                                  </span>
                                ) : member.paidStatus === 'Paid' ? (
                                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded border border-emerald-500/20 uppercase">
                                    Paid
                                  </span>
                                ) : null}
                              </button>
                            ))
                          )}
                          {membersData?.allMembers?.results?.length === 0 && !membersLoading && (
                            <div className="p-4 text-xs text-textMuted text-center">No matching members.</div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="font-bold text-white">{renewalPrefill.fullName}</p>
                    <p className="text-xs text-textMuted mt-1">{renewalPrefill.phoneNumber}</p>
                  </div>
                )}
              </div>

              {selectedMember && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex justify-between items-center"
                >
                  <div>
                    <p className="text-[10px] text-primary uppercase font-bold tracking-widest">Plan</p>
                    <p className="text-sm font-bold text-white">{selectedMember.membershipPlan.planName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-primary uppercase font-bold tracking-widest">Base fee</p>
                    <p className="text-sm font-bold text-white">Rs.{selectedMember.membershipPlan.price}</p>
                  </div>
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Amount (Rs.) *</label>
                <input
                  required
                  type="number"
                  className="input-field"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Fee month *</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted group-focus-within:text-primary transition-colors" />
                  <input
                    required
                    type="month"
                    min={currentMonthStr}
                    className="input-field pl-12"
                    value={formData.monthStr.substring(0, 7)}
                    onChange={(e) => setFormData({ ...formData, monthStr: `${e.target.value}-01` })}
                  />
                </div>
              </div>
            </form>

            <div className="p-8 bg-white/[0.02] border-t border-white/5 flex justify-end gap-4">
              <button type="button" onClick={handleClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-textMuted hover:text-white">
                Cancel
              </button>
              <button
                disabled={saving || !selectedMember}
                type="submit"
                onClick={handleSubmit}
                className="btn-primary flex items-center px-8"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {saving ? 'Saving...' : renewalPrefill ? 'Record renewal payment' : 'Record payment'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
