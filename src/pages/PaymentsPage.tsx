import { useState, useEffect, useRef } from 'react';

import {
    gql,
    useQuery,
    useMutation,
    useLazyQuery,
} from '@apollo/client';

import { useSearchParams } from 'react-router-dom';

import {
    Plus,
    Download,
    RefreshCw,
    ChevronRight,
    User,
    Calendar,
    Loader2,
    X,
    Clock3,
    Search,
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

import RecordPaymentModal, {
    type RenewalPrefill,
} from '../components/RecordPaymentModal';

import Pagination from '../components/Pagination';

import {
    LIVE_QUERY_NAMES,
    GET_EXPIRED_FOR_RENEWAL,
    GET_MEMBER_FOR_RENEW_NAV,
} from '../graphql/queries';

import { useModalStore } from '../store/modalStore';

const GET_PAYMENTS = gql`
  query GetRecentPayments(
    $search: String
    $month: String
    $page: Int
    $pageSize: Int
    $memberStatus: String
  ) {
    recentPayments(
      search: $search
      month: $month
      page: $page
      pageSize: $pageSize
      memberStatus: $memberStatus
    ) {
      count
      page
      totalPages

      results {
        id
        amount
        month
        paymentDate
        status

        member {
          id
          fullName
          fatherName
          phoneNumber
          status
        }
      }
    }
  }
`;

const GET_MEMBER_PAYMENT_HISTORY = gql`
  query GetMemberPaymentHistory(
    $memberId: UUID!
    $page: Int
    $pageSize: Int
  ) {
    recentPayments(
      memberId: $memberId
      page: $page
      pageSize: $pageSize
    ) {
      count
      totalPages

      results {
        id
        amount
        month
        paymentDate
        status
      }
    }
  }
`;

const DELETE_PAYMENT = gql`
  mutation DeletePayment($id: UUID!) {
    deletePayment(paymentId: $id)
  }
`;

interface PaymentRecord {
    id: string;
    amount: number;
    month: string;
    paymentDate: string;
    status: string;

    member: {
        id: string;
        fullName: string;
        phoneNumber: string;
        status: string;
    };
}

export default function PaymentsPage() {
    const { showConfirm } = useModalStore();

    const [searchTerm, setSearchTerm] = useState('');

    const [monthFilter, setMonthFilter] = useState('');

    const [memberStatusFilter, setMemberStatusFilter] =
        useState('');

    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [currentPage, setCurrentPage] =
        useState(1);

    const [pageSize, setPageSize] =
        useState(10);

    const [expiredPage, setExpiredPage] =
        useState(1);

    const expiredPageSize = 3;

    const [selectedMember, setSelectedMember] =
        useState<any | null>(null);

    const [historyPage, setHistoryPage] =
        useState(1);

    const historyPageSize = 5;

    const [searchParams, setSearchParams] =
        useSearchParams();

    const renewParam =
        searchParams.get('renew');

    const consumedRenewRef =
        useRef<string | null>(null);

    const [renewalPrefill, setRenewalPrefill] =
        useState<RenewalPrefill | null>(null);

    const {
        data: expiredRenewData,
        refetch: refetchExpiredRenew,
    } = useQuery(
        GET_EXPIRED_FOR_RENEWAL,
        {
            fetchPolicy: 'cache-and-network',
        }
    );

    const {
        data: renewNavMember,
    } = useQuery(
        GET_MEMBER_FOR_RENEW_NAV,
        {
            variables: {
                id: renewParam,
            },
            skip: !renewParam,
        }
    );

    const [
        loadHistory,
        {
            data: historyData,
            loading: historyLoading,
        },
    ] = useLazyQuery(
        GET_MEMBER_PAYMENT_HISTORY
    );

    useEffect(() => {
        if (!renewParam) {
            consumedRenewRef.current = null;
        }
    }, [renewParam]);

    useEffect(() => {
        const rid = renewParam;

        if (
            !rid ||
            !renewNavMember?.member
        )
            return;

        if (
            consumedRenewRef.current === rid
        )
            return;

        const m = renewNavMember.member;

        consumedRenewRef.current = rid;

        if (m.status !== 'Expired') {
            setSearchParams(
                (prev) => {
                    const n =
                        new URLSearchParams(prev);

                    n.delete('renew');

                    return n;
                },
                { replace: true }
            );

            return;
        }

        setRenewalPrefill({
            id: m.id,
            fullName: m.fullName,
            phoneNumber: m.phoneNumber,
            expiryDate: m.expiryDate,
            status: m.status,

            membershipPlan: {
                planName:
                    m.membershipPlan.planName,

                price:
                    m.membershipPlan.price,
            },
        });

        setIsModalOpen(true);

        setSearchParams(
            (prev) => {
                const n =
                    new URLSearchParams(prev);

                n.delete('renew');

                return n;
            },
            { replace: true }
        );
    }, [
        renewParam,
        renewNavMember,
        setSearchParams,
    ]);

    const expiredForRenewal =
        (
            expiredRenewData?.allMembers
                ?.results ?? []
        ).filter(
            (m: any) =>
                m.status === 'Expired'
        ) as RenewalPrefill[];

    const paginatedExpired =
        expiredForRenewal.slice(
            (expiredPage - 1) *
            expiredPageSize,
            expiredPage * expiredPageSize
        );

    const expiredTotalPages =
        Math.ceil(
            expiredForRenewal.length /
            expiredPageSize
        );

    const {
        data,
        loading,
        error,
        refetch,
    } = useQuery(GET_PAYMENTS, {
        variables: {
            search:
                searchTerm || null,

            month: monthFilter
                ? `${monthFilter}-01`
                : null,

            memberStatus:
                memberStatusFilter ||
                null,

            page: currentPage,
            pageSize,
        },

        fetchPolicy:
            'cache-and-network',
    });

    const pageData =
        data?.recentPayments;

    const payments =
        (
            pageData?.results || []
            // )
        )

    const totalCount = (
        pageData?.count ?? 0
    );

    const totalPages =
        pageData?.totalPages ?? 1;

    const [deletePayment] =
        useMutation(
            DELETE_PAYMENT,
            {
                refetchQueries:
                    LIVE_QUERY_NAMES,

                onCompleted: () =>
                    refetch(),
            }
        );

    const handleDelete = async (
        id: string
    ) => {
        showConfirm({
            title:
                'Reverse Transaction',

            message:
                'Are you sure you want to reverse this payment record?',

            confirmText:
                'Yes, Reverse',

            onConfirm: async () => {
                await deletePayment({
                    variables: { id },

                    optimisticResponse: {
                        deletePayment: true,
                    },
                });
            },
        });
    };

    const handleExport = () => {
        const headers = [
            'Member',
            'Phone',
            'Amount',
            'Month',
            'Payment Date',
            'Status',
        ];

        const rows = payments.map(
            (p: PaymentRecord) => [
                p.member.fullName,
                p.member.phoneNumber,
                p.amount,
                p.month,
                p.paymentDate,
                p.status,
            ]
        );

        const csvContent =
            'data:text/csv;charset=utf-8,' +
            headers.join(',') +
            '\n' +
            rows
                .map((e: any) =>
                    e.join(',')
                )
                .join('\n');

        const encodedUri =
            encodeURI(csvContent);

        const link =
            document.createElement('a');

        link.setAttribute(
            'href',
            encodedUri
        );

        link.setAttribute(
            'download',
            `payments_export_${new Date()
                .toISOString()
                .split('T')[0]
            }.csv`
        );

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
    };

    const openHistory = async (
        member: any,
        page = 1
    ) => {
        setSelectedMember(member);

        setHistoryPage(page);

        await loadHistory({
            variables: {
                memberId:
                    member.id.trim(),
                page,
                pageSize:
                    historyPageSize,
            },
        });
    };

    return (
        <div className="space-y-6 relative">
            {/* HEADER */}

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-textMain tracking-tight">
                        Payment Ledger
                    </h1>

                    <p className="text-sm text-textMuted font-bold uppercase tracking-widest mt-1">
                        Premium transaction
                        management
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="btn-secondary flex items-center justify-center py-3"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Export CSV
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setRenewalPrefill(null);

                            setIsModalOpen(true);
                        }}
                        className="btn-primary flex items-center justify-center py-3"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Record Payment
                    </button>
                </div>
            </div>

            {/* EXPIRED */}

            {expiredForRenewal.length >
                0 && (
                    <div className="glass-panel p-6 border border-orange-500/20">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black text-textMain flex items-center gap-3">
                                    <RefreshCw className="w-5 h-5 text-orange-400" />

                                    Membership Renewals
                                </h2>

                                <p className="text-xs text-textMuted uppercase tracking-widest mt-2">
                                    Expired members
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-4xl font-black text-orange-400">
                                    {
                                        expiredForRenewal.length
                                    }
                                </p>

                                <p className="text-xs text-textMuted uppercase tracking-widest">
                                    Expired
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                            {paginatedExpired.map(
                                (m) => (
                                    <motion.div
                                        whileHover={{
                                            y: -4,
                                        }}
                                        key={m.id}
                                        className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                                    >
                                        <div className="flex justify-between">
                                            <div>
                                                <h3 className="font-black text-textMain text-lg">
                                                    {m.fullName}
                                                </h3>

                                                <p className="text-xs text-textMuted">
                                                    {
                                                        m.phoneNumber
                                                    }
                                                </p>
                                            </div>

                                            {/* <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase">
                      Expired
                    </span> */}
                                            <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase text-center inline-flex items-center justify-center">
                                                Expired
                                            </span>
                                        </div>

                                        <div className="mt-5 space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-textMuted">
                                                    Plan
                                                </span>

                                                <span className="font-bold text-textMain">
                                                    {
                                                        m
                                                            .membershipPlan
                                                            .planName
                                                    }
                                                </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-textMuted">
                                                    Renewal Fee
                                                </span>

                                                <span className="font-black text-primary">
                                                    Rs.
                                                    {
                                                        m
                                                            .membershipPlan
                                                            .price
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setRenewalPrefill(
                                                    m
                                                );

                                                setIsModalOpen(
                                                    true
                                                );
                                            }}
                                            className="w-full mt-5 py-3 rounded-2xl bg-primary text-black font-black flex items-center justify-center gap-2"
                                        >
                                            Renew Membership

                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                )
                            )}
                        </div>

                        {expiredTotalPages >
                            1 && (
                                <div className="mt-6">
                                    <Pagination
                                        page={
                                            expiredPage
                                        }
                                        totalPages={
                                            expiredTotalPages
                                        }
                                        count={
                                            expiredForRenewal.length
                                        }
                                        pageSize={
                                            expiredPageSize
                                        }
                                        onPageChange={
                                            setExpiredPage
                                        }
                                        onPageSizeChange={() => { }}
                                    />
                                </div>
                            )}
                    </div>
                )}

            {/* FILTERS */}

            <div className="glass-panel p-4 flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />

                    <input
                        type="text"
                        placeholder="Search member..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(
                                e.target.value
                            );

                            setCurrentPage(1);
                        }}
                        className="input-field pl-12"
                    />
                </div>

                <input
                    type="month"
                    value={monthFilter}
                    onChange={(e) => {
                        setMonthFilter(
                            e.target.value
                        );

                        setCurrentPage(1);
                    }}
                    className="input-field lg:w-[200px]"
                />

                <select
                    value={
                        memberStatusFilter
                    }
                    onChange={(e) => {
                        setMemberStatusFilter(
                            e.target.value
                        );

                        setCurrentPage(1);
                    }}
                    className="input-field lg:w-[200px]"
                >
                    <option value="">
                        All Members
                    </option>

                    <option value="Active">
                        Active
                    </option>

                    <option value="Inactive">
                        Inactive
                    </option>
                </select>
            </div>

            {/* TABLE */}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="glass-panel p-6 text-red-400">
                    {error.message}
                </div>
            ) : (
                <>
                    <div className="glass-panel overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-borderLine text-left text-xs uppercase tracking-widest text-textMuted">
                                        <th className="p-4">
                                            Member
                                        </th>

                                        <th className="p-4">
                                            Amount
                                        </th>

                                        <th className="p-4">
                                            Month
                                        </th>

                                        <th className="p-4">
                                            Collected
                                        </th>

                                        <th className="p-4">
                                            Status
                                        </th>

                                        <th className="p-4 text-right">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {payments.map(
                                        (
                                            payment:
                                                PaymentRecord,
                                            i: number
                                        ) => (
                                            <motion.tr
                                                key={
                                                    payment.id
                                                }
                                                initial={{
                                                    opacity: 0,
                                                    y: 10,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                transition={{
                                                    delay:
                                                        i * 0.02,
                                                }}
                                                className="border-b border-borderLine hover:bg-white/[0.03]"
                                            >
                                                <td className="p-4">
                                                    <button
                                                        onClick={() =>
                                                            openHistory(
                                                                payment.member
                                                            )
                                                        }
                                                        className="flex items-center gap-3 text-left"
                                                    >
                                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                            <User className="w-5 h-5 text-primary" />
                                                        </div>

                                                        <div>
                                                            <p className="font-black text-textMain">
                                                                {
                                                                    payment
                                                                        .member
                                                                        .fullName
                                                                }
                                                            </p>

                                                            <p className="text-xs text-textMuted">
                                                                {
                                                                    payment
                                                                        .member
                                                                        .phoneNumber
                                                                }
                                                            </p>
                                                        </div>
                                                    </button>
                                                </td>

                                                <td className="p-4 font-black text-textMain">
                                                    Rs.
                                                    {payment.amount.toLocaleString()}
                                                </td>

                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-primary" />

                                                        {new Date(
                                                            payment.month
                                                        ).toLocaleString(
                                                            'default',
                                                            {
                                                                month:
                                                                    'long',
                                                                year:
                                                                    'numeric',
                                                            }
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="p-4 text-sm text-textMuted">
                                                    {
                                                        payment.paymentDate
                                                    }
                                                </td>

                                                <td className="p-4">
                                                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase">
                                                        {
                                                            payment.status
                                                        }
                                                    </span>
                                                </td>

                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                payment.id
                                                            )
                                                        }
                                                        // className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase"
                                                        className="flex items-center gap-2 ml-auto px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 cursor-pointer"
                                                    >
                                                        Reverse
                                                    </button>
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
                        onPageChange={
                            setCurrentPage
                        }
                        onPageSizeChange={(
                            size
                        ) => {
                            setPageSize(size);

                            setCurrentPage(1);
                        }}
                    />
                </>
            )}

            {/* HISTORY MODAL */}

            <AnimatePresence>
                {selectedMember && (
                    <motion.div
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{
                                scale: 0.95,
                                opacity: 0,
                            }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                            }}
                            exit={{
                                scale: 0.95,
                                opacity: 0,
                            }}
                            className="w-full max-w-2xl glass-panel p-6 rounded-3xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-textMain">
                                        Payment History
                                    </h2>

                                    <p className="text-sm text-textMuted">
                                    {selectedMember.fullName}{" "}
                                    {selectedMember.fatherName}
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        setSelectedMember(
                                            null
                                        )
                                    }
                                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {historyLoading ? (
                                <div className="py-16 flex justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                        {(
                                            historyData
                                                ?.recentPayments
                                                ?.results || []
                                        ).map(
                                            (p: any) => (
                                                <div
                                                    key={p.id}
                                                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex justify-between"
                                                >
                                                    <div>
                                                        <p className="font-black text-textMain">
                                                            Rs.
                                                            {
                                                                p.amount
                                                            }
                                                        </p>

                                                        <p className="text-xs text-textMuted mt-1 flex items-center gap-1">
                                                            <Clock3 className="w-3 h-3" />

                                                            {new Date(
                                                                p.month
                                                            ).toLocaleString(
                                                                'default',
                                                                {
                                                                    month:
                                                                        'long',
                                                                    year:
                                                                        'numeric',
                                                                }
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="text-right">
                                                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase">
                                                            {
                                                                p.status
                                                            }
                                                        </span>

                                                        <p className="text-xs text-textMuted mt-2">
                                                            {
                                                                p.paymentDate
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <div className="mt-6">
                                        <Pagination
                                            page={
                                                historyPage
                                            }
                                            totalPages={
                                                historyData
                                                    ?.recentPayments
                                                    ?.totalPages ||
                                                1
                                            }
                                            count={
                                                historyData
                                                    ?.recentPayments
                                                    ?.count ||
                                                0
                                            }
                                            pageSize={
                                                historyPageSize
                                            }
                                            onPageChange={(
                                                page
                                            ) =>
                                                openHistory(
                                                    selectedMember,
                                                    page
                                                )
                                            }
                                            onPageSizeChange={() => { }}
                                        />
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <RecordPaymentModal
                isOpen={isModalOpen}
                renewalPrefill={
                    renewalPrefill
                }
                onClose={() => {
                    setIsModalOpen(false);

                    setRenewalPrefill(null);
                }}
                onSuccess={() => {
                    refetch();

                    refetchExpiredRenew();
                }}
            />
        </div>
    );
}   