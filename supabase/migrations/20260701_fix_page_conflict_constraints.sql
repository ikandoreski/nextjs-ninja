delete from page_blocks a
using page_blocks b
where a.ctid < b.ctid
  and a.page_id = b.page_id
  and a.block_key = b.block_key;

create unique index if not exists idx_page_blocks_page_id_block_key_unique
on page_blocks(page_id, block_key);

delete from page_seo a
using page_seo b
where a.ctid < b.ctid
  and a.page_id = b.page_id;

create unique index if not exists idx_page_seo_page_id_unique
on page_seo(page_id);
