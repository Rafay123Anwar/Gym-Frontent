import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useSearchParams } from 'react-router-dom';
import {
    RefreshCw,
    ChevronRight,
    Search,
    ArrowLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';
import RecordPaymentModal, {
    type RenewalPrefill,
} from '../components/RecordPaymentModal';
import Pagination from '../components/Pagination';
import {
    GET_EXPIRED_FOR_RENEWAL,
    GET_MEMBER_FOR_RENEW_NAV,
} from '../graphql/queries';

export default function MembershipRenewalPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [renewalPrefill, setRenewalPrefill] = useState<RenewalPrefill | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const renewParam = searchParams.get('renew');
    const consumedRenewRef = useRef<string | null>(null);

    const { data: expiredRenewData, refetch: refetchExpiredRenew } = useQuery(
        GET_EXPIRED_FOR_RENEWAL,
        {
            fetchPolicy: 'cache-and-network',
        }
    );

    const { data: renewNavMember } = useQuery(
        GET_MEMBER_FOR_RENEW_NAV,
        {
            variables: {
                id: renewParam,
            },
            skip: !renewParam,
        }
    );

    useEffect(() => {
        if (!renewParam) {
            consumedRenewRef.current = null;
        }
    }, [renewParam]);

    useEffect(() => {
        const rid = renewParam;

        if (!rid || !renewNavMember?.member) return;

        if (consumedRenewRef.current === rid) return;

        const m = renewNavMember.member;
        consumedRenewRef.current = rid;

        if (m.status !== 'Expired') {
            setSearchParams(
                (prev) => {
                    const n = new URLSearchParams(prev);
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
                planName: m.membershipPlan.planName,
                price: m.membershipPlan.price,
            },
        });

        setIsModalOpen(true);

        setSearchParams(
            (prev) => {
                const n = new URLSearchParams(prev);
                n.delete('renew');
                return n;
            },
            { replace: true }
        );
    }, [renewParam, renewNavMember, setSearchParams]);

    const expiredForRenewal = (
        expiredRenewData?.allMembers?.results ?? []
    ).filter((m: any) => m.status === 'Expired') as RenewalPrefill[];

    // Helper function to normalize phone numbers for Pakistan format
    // Handles both +923XX and 03XX formats
    const normalizePhone = (phone: string) => {
        // Remove all non-digits
        let normalized = phone.replace(/\D/g, '');
        
        // If starts with 92 (international), remove it to get local format
        if (normalized.startsWith('92')) {
            normalized = '0' + normalized.substring(2);
        }
        
        return normalized;
    };

    // Filter by search term - flexible phone number search
    const filteredMembers = expiredForRenewal.filter(
        (m) => {
            if (!searchTerm.trim()) return true; // Show all if search is empty
            
            const searchLower = searchTerm.toLowerCase().trim();
            
            // Match by name
            if (m.fullName.toLowerCase().includes(searchLower)) {
                return true;
            }
            
            // Normalize both phone and search term for comparison
            const normalizedSearch = normalizePhone(searchTerm);
            const normalizedPhone = normalizePhone(m.phoneNumber);
            
            // Match if search digits appear anywhere in the normalized phone number
            // and search has at least 2 digits (allow "03", "034", etc)
            if (normalizedSearch.length >= 2) {
                return normalizedPhone.includes(normalizedSearch);
            }
            
            return false;
        }
    );

    const totalPages = Math.ceil(filteredMembers.length / pageSize);
    const paginatedMembers = filteredMembers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleRenew = (member: RenewalPrefill) => {
        setRenewalPrefill(member);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 relative">
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all"
                        >
                            <ArrowLeft className="w-5 h-5 text-textMuted" />
                        </button>
                        <h1 className="text-3xl font-black text-textMain tracking-tight">
                            Membership Renewal
                        </h1>
                    </div>
                    <p className="text-sm text-textMuted font-bold uppercase tracking-widest ml-11">
                        Renew expired memberships
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="glass-panel px-6 py-3 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-orange-400" />
                        <div>
                            <p className="text-xs text-textMuted uppercase">Expired Members</p>
                            <p className="text-2xl font-black text-textMain">
                                {expiredForRenewal.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEARCH */}
            <div className="glass-panel p-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
                    <input
                        type="text"
                        placeholder="Search by name or phone number..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="input-field w-full pl-12"
                    />
                </div>
            </div>

            {/* RENEWAL CARDS GRID */}
            {expiredForRenewal.length === 0 ? (
                <div className="glass-panel p-12 text-center">
                    <RefreshCw className="w-16 h-16 text-textMuted/30 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-textMain mb-2">No Expired Memberships</h3>
                    <p className="text-textMuted">All members have active memberships!</p>
                </div>
            ) : filteredMembers.length === 0 ? (
                <div className="glass-panel p-12 text-center">
                    <Search className="w-16 h-16 text-textMuted/30 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-textMain mb-2">No Results Found</h3>
                    <p className="text-textMuted">Try adjusting your search criteria</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {paginatedMembers.map((member) => (
                            <motion.div
                                whileHover={{
                                    y: -4,
                                }}
                                key={member.id}
                                className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                            >
                                <div className="flex justify-between">
                                    <div>
                                        <h3 className="font-black text-textMain text-lg">
                                            {member.fullName}
                                        </h3>

                                        <p className="text-xs text-textMuted">
                                            {member.phoneNumber}
                                        </p>
                                    </div>

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
                                            {member.membershipPlan.planName}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-textMuted">
                                            Renewal Fee
                                        </span>

                                        <span className="font-black text-primary">
                                            Rs.
                                            {member.membershipPlan.price}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        handleRenew(member);
                                    }}
                                    className="w-full mt-5 py-3 rounded-2xl bg-primary text-black font-black flex items-center justify-center gap-2"
                                >
                                    Renew Membership

                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    <Pagination
                        page={currentPage}
                        totalPages={totalPages}
                        count={filteredMembers.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setCurrentPage(1);
                        }}
                    />
                </>
            )}

            {/* RENEWAL MODAL */}
            <RecordPaymentModal
                isOpen={isModalOpen}
                renewalPrefill={renewalPrefill}
                onClose={() => {
                    setIsModalOpen(false);
                    setRenewalPrefill(null);
                }}
                onSuccess={() => {
                    refetchExpiredRenew();
                }}
            />
        </div>
    );
}
