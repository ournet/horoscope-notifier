import { GraphQLQueryExecutor, OurnetQueryApi, OurnetMutationApi } from '@ournet/api-client';

const executor = new GraphQLQueryExecutor(process.env.OURNET_API_HOST || 'http://ournetapi.com/graphql');

export function createQueryApiClient<QT>(): OurnetQueryApi<QT> {
    return new OurnetQueryApi<QT>(executor)
}

export function createMutationApiClient<QT>(): OurnetMutationApi<QT> {
    return new OurnetMutationApi<QT>(executor);
}

export async function executeApiClient<APIT>(client: OurnetQueryApi<APIT>) {
    const apiResult = await client.execute();
    if (apiResult.errors) {
        throw new Error(apiResult.errors[0].message);
    }
    return apiResult.data;
}
