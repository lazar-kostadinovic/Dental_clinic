using Microsoft.EntityFrameworkCore;
using StomatoloskaOrdinacija.Models;

namespace StomatoloskaOrdinacija
{
    public class OrdinacijaDbContext : DbContext
    {
        public OrdinacijaDbContext(DbContextOptions<OrdinacijaDbContext> options)
            : base(options)
        {
        }

        public DbSet<Admin> Admin { get; set; }
        public DbSet<Pacijent> Pacijenti { get; set; }
        public DbSet<Pregled> Pregledi { get; set; }
        public DbSet<Stomatolog> Stomatolozi { get; set; }
        public DbSet<OcenaStomatologa> OceneStomatologa { get; set; }
        public DbSet<Intervencija> Intervencije { get; set; }
        public DbSet<PregledIntervencija> PreglediIntervencije { get; set; }

        // protected override void OnModelCreating(ModelBuilder modelBuilder)
        // {
        //     base.OnModelCreating(modelBuilder);

        //     modelBuilder.Entity<PregledIntervencija>()
        //         .HasKey(pi => new { pi.PregledId, pi.IntervencijaId });

        //     modelBuilder.Entity<PregledIntervencija>()
        //         .HasOne(pi => pi.Pregled)
        //         .WithMany(p => p.PregledIntervencije)
        //         .HasForeignKey(pi => pi.PregledId);

        //     modelBuilder.Entity<PregledIntervencija>()
        //         .HasOne(pi => pi.Intervencija)
        //         .WithMany(i => i.PregledIntervencije)
        //         .HasForeignKey(pi => pi.IntervencijaId);

        //     modelBuilder.Entity<OcenaStomatologa>()
        //         .HasOne(o => o.Stomatolog)
        //         .WithMany(s => s.KomentariStomatologa)
        //         .HasForeignKey(o => o.IdStomatologa);

        //     modelBuilder.Entity<OcenaStomatologa>()
        //         .HasOne(o => o.Pacijent)
        //         .WithMany(p => p.KomentariPacijenta)
        //         .HasForeignKey(o => o.IdPacijenta);

        //     modelBuilder.Entity<Pacijent>()
        //         .HasMany(p => p.IstorijaPregleda)
        //         .WithOne()
        //         .HasForeignKey(p => p.IdPacijenta);

        //     modelBuilder.Entity<Pregled>()
        //         .HasOne(p => p.Pacijent)
        //         .WithMany(pa => pa.IstorijaPregleda)
        //         .HasForeignKey(p => p.IdPacijenta);

        //     modelBuilder.Entity<Pregled>()
        //         .HasOne(p => p.Pacijent)
        //         .WithMany(pa => pa.IstorijaPregleda)
        //         .HasForeignKey(p => p.IdPacijenta);
        // }

    }
}
