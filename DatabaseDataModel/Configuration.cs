using EFCache;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Core.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DatabaseDataModel
{
    public class Configuration : DbConfiguration
    {
        internal static readonly InMemoryCache Cache = new InMemoryCache();
        public Configuration()
        {
            var transactionHandler = new CacheTransactionHandler(Cache);

            AddInterceptor(transactionHandler);

            Loaded +=
              (sender, args) => args.ReplaceService<DbProviderServices>(
                (s, _) => new CachingProviderServices(s, transactionHandler));
        }
    }
}