export type IUserRead = {
    sub: string;
    nickname: string;
    email: string;
    given_name?: (string | null);
    family_name?: (string | null);
    name?: (string | null);
    picture?: (string | null);
    email_verified?: boolean;
    locale?: (string | null);
    balance?: number;
    vip?: boolean;
    admin?: boolean;
    id: string;
};
//# sourceMappingURL=IUserRead.d.ts.map