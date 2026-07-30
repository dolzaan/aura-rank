import Link from "next/link";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Music2,
  Play,
  Send,
  Sparkles,
  Volume2,
} from "lucide-react";
import { posts } from "@/lib/mock";

export default function Feed() {
  return (
    <section className="reels-page">
      <header className="reels-topbar glass">
        <Link href="/" className="reels-brand" aria-label="AuraRank">
          AURA<span className="lime">RANK</span>
        </Link>
        <nav className="reels-tabs" aria-label="Filtro do feed">
          <button type="button" className="reels-tab muted">Seguindo</button>
          <button type="button" className="reels-tab reels-tab-active">Para você</button>
        </nav>
        <Link href="/upload" className="reels-create" aria-label="Publicar vídeo">
          <Sparkles size={18} />
          <span className="desktop-only">Farmar</span>
        </Link>
      </header>

      <div className="reels-feed" aria-label="Feed de vídeos de aura">
        {posts.map((post, index) => (
          <article className="reel" key={`${post.user.username}-${index}`}>
            <div className="reel-video video-surface">
              <button className="reel-sound glass" type="button" aria-label="Ativar som">
                <Volume2 size={18} />
              </button>

              <button className="reel-play glass" type="button" aria-label="Reproduzir vídeo">
                <Play size={30} fill="currentColor" />
              </button>

              <div className="reel-score glass">
                <Sparkles size={16} />
                +{post.points.toLocaleString("pt-BR")} AURA
              </div>

              <div className="reel-gradient" />

              <div className="reel-content">
                <div className="reel-copy">
                  <Link href={`/perfil/${post.user.username}`} className="reel-author">
                    <span className="story-ring reel-avatar">
                      <span className="story-inner">{post.user.avatar}</span>
                    </span>
                    <span>
                      <strong>@{post.user.username}</strong>
                      <small>Seguir</small>
                    </span>
                  </Link>

                  <p>{post.caption}</p>

                  <div className="reel-music">
                    <Music2 size={15} />
                    <span>Som original • @{post.user.username}</span>
                  </div>

                  <div className="reel-tags">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>

                <aside className="reel-actions" aria-label="Ações do vídeo">
                  <Link href={`/perfil/${post.user.username}`} className="reel-profile-action" aria-label={`Perfil de ${post.user.username}`}>
                    {post.user.avatar}
                    <span>+</span>
                  </Link>
                  <button type="button" aria-label="Curtir">
                    <Heart size={29} />
                    <span>{index === 0 ? "12,8 mil" : "8.421"}</span>
                  </button>
                  <button type="button" aria-label="Comentar">
                    <MessageCircle size={29} />
                    <span>{index === 0 ? "684" : "392"}</span>
                  </button>
                  <button type="button" aria-label="Compartilhar">
                    <Send size={28} />
                    <span>{index === 0 ? "1.204" : "829"}</span>
                  </button>
                  <button type="button" aria-label="Salvar">
                    <Bookmark size={28} />
                    <span>Salvar</span>
                  </button>
                  <button type="button" aria-label="Mais opções">
                    <MoreHorizontal size={27} />
                  </button>
                </aside>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
