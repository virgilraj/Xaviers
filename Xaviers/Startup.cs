using EFCache;
using Microsoft.Owin;
using Owin;
using System.Data.Entity;
using System.Data.Entity.Core.Common;

[assembly: OwinStartupAttribute(typeof(Xaviers.Startup))]
namespace Xaviers
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
